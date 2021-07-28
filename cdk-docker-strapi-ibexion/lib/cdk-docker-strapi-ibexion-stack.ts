import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as s3 from "@aws-cdk/aws-s3";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as iam from "@aws-cdk/aws-iam";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { Duration, RemovalPolicy } from "@aws-cdk/core";
import { Rule, Schedule } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { SES_EMAIL_FROM, SES_REGION, PROJECT_NAME } from "../env";

if (!PROJECT_NAME) {
  throw new Error(
    "Please add the PROJECT_NAME environment variables in an env.ts file located in the root directory"
  );
}

if (!SES_EMAIL_FROM || !SES_REGION) {
  throw new Error(
    "Please add the SES_EMAIL_TO, SES_EMAIL_FROM and SES_REGION environment variables in an env.ts file located in the root directory"
  );
}

export class CdkDockerStrapiIbexionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const vpc = new ec2.Vpc(this, `VPC-${PROJECT_NAME}-Strapi`, {
      maxAzs: 2,
      natGateways: 1,
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: new ec2.InstanceType("t2.nano"),
      }),
    });

    const devDB = new rds.DatabaseInstance(this, `${PROJECT_NAME}StrapiDevDB`, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_4,
      }),
      databaseName: `${PROJECT_NAME}StrapiDevDB`,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      publiclyAccessible: true,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret("postgres"), // Creates an admin user of postgres with a generated password
    });

    devDB.connections.allowFromAnyIpv4(ec2.Port.tcp(5432));

    const bucket = new s3.Bucket(
      this,
      `${PROJECT_NAME}-strapi-image-upload-bucket`,
      {
        bucketName: `${PROJECT_NAME}-strapi-image-upload-bucket`,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        accessControl: s3.BucketAccessControl.PUBLIC_READ_WRITE,
        versioned: false,
        encryption: s3.BucketEncryption.UNENCRYPTED,
        cors: [
          {
            allowedMethods: [
              s3.HttpMethods.GET,
              s3.HttpMethods.POST,
              s3.HttpMethods.PUT,
              s3.HttpMethods.HEAD,
              s3.HttpMethods.DELETE,
            ],
            allowedOrigins: ["localhost:1337", "localhost:3000"],
            allowedHeaders: ["*"],
          },
        ],
        lifecycleRules: [
          {
            abortIncompleteMultipartUploadAfter: cdk.Duration.days(14),

            transitions: [
              {
                storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                transitionAfter: cdk.Duration.days(30),
              },
            ],
          },
        ],
      }
    );

    /* // 👇 get secret by partial ARN
    const strapiJWT = secretsmanager.Secret.fromSecretAttributes(
      this,
      "db-pwd-id",
      {
        secretPartialArn:
          "arn:aws:secretsmanager:eu-central-1:237861303486:secret:prod/lambda/strapi",
      }
    );



    // 👇 create the lambda that sends emails
    const mailerFunction = new lambda.NodejsFunction(this, "mailer-function", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      entry: "lambda/mailer.ts", // accepts .js, .jsx, .ts and .tsx files
      handler: "handler", // defaults to 'handler'
    });

    // 👇 Add permissions to the Lambda function to send Emails
    mailerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: ["*"],
      })
    );

    // Create EventBridge rule that will execute our Lambda every 2 minutes
    const schedule = new Rule(this, "scheduledLambda-schedule", {
      schedule: Schedule.expression("rate(6 hours)"),
    });

    // Set the target of our EventBridge rule to our Lambda function
    schedule.addTarget(new LambdaFunction(mailerFunction)); */

    new cdk.CfnOutput(this, `bucketName${PROJECT_NAME}`, {
      value: bucket.bucketName,
      exportName: `bucketName${PROJECT_NAME}`,
    });

    new cdk.CfnOutput(this, `DBEndpoint${PROJECT_NAME}`, {
      value: devDB.instanceEndpoint.hostname,
      exportName: `DBEndpoint${PROJECT_NAME}`,
    });

    new cdk.CfnOutput(this, `secretName${PROJECT_NAME}`, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      value: devDB.secret?.secretName!,
    });
  }
}
