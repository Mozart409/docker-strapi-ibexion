var AWS = require("aws-sdk"),
  region = "eu-central-1";
const fetch = require("node-fetch");

import { SES_EMAIL_FROM, SES_EMAIL_TO, SES_REGION } from "env";

if (!SES_EMAIL_TO || !SES_EMAIL_FROM || !SES_REGION) {
  throw new Error(
    "Please add the SES_EMAIL_TO, SES_EMAIL_FROM and SES_REGION environment variables in an env.js file located in the root directory"
  );
}

interface IMessage {
  id?: string;
  email?: string;
  status?: string;
  location?: string;
  subject?: string;
  message?: string;
  tel?: string;
  checkbox?: string;
  created_at?: string;
  updated_at?: string;
}

interface IContactDetails {
  name: string;
  email: string;
  message: IMessage[];
}

exports.handler = async (event: any, context: any) => {
  const acccessJWT = "";

  const res = await fetch(
    "https://docker-strapi-beammeup.lekttuc4ko6uu.eu-central-1.cs.amazonlightsail.com/lead-form-submissions",
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${acccessJWT}`,
      },
    }
  );
  const resJson: IMessage[] = await res.json();
  // console.log(resJson);

  try {
    return await sendEmail({
      name: "Strapi Lead Form",
      email: "maderamadeus@gmail.com",
      message: resJson,
    });
  } catch (error: unknown) {
    console.log("ERROR is: ", error);
    if (error instanceof Error) {
      return JSON.stringify({
        body: { error: error.message },
        statusCode: 400,
      });
    }
    return JSON.stringify({
      body: { error: JSON.stringify(error) },
      statusCode: 400,
    });
  }
};

async function sendEmail({ name, email, message }: IContactDetails) {
  const ses = new AWS.SES({ region: SES_REGION });

  console.log("sendEmail Function" + message);
  await ses.sendEmail(sendEmailParams({ name, email, message })).promise();

  return JSON.stringify({
    body: { message: "Email sent successfully 🎉🎉🎉" },
    statusCode: 200,
  });
}

function sendEmailParams({ name, email, message }: IContactDetails) {
  return {
    Destination: {
      ToAddresses: [SES_EMAIL_TO],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: getHtmlContent({ name, email, message }),
        },
        Text: {
          Charset: "UTF-8",
          Data: getTextContent({ name, email, message }),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Strapi Lead Forms.`,
      },
    },
    Source: SES_EMAIL_FROM,
  };
}

function getHtmlContent({ name, email, message }: IContactDetails) {
  console.log("getHtmlContent Function" + message);
  return `
  <html>
  <body>
    <div>
      <h1>Received an Email. 📬</h1>

      <p style="font-size: 18px">👤 <b>${name}</b></p>
      <ul>
        ${message
          .map(
            (item) => `
        <p style="font-size: 16px">MessageID: ${item.id}</p>
        <li style="font-size: 14px">Status: ${item.status}</li>
        <li style="font-size: 14px">Email: ${item.email}</li>
        <li style="font-size: 14px">Created At: ${item.created_at}</li>
        <li style="font-size: 14px">Message: ${item.message}</li>
        `
          )
          .join("")}
      </ul>
    </div>
  </body>
</html>
  `;
}

function getTextContent({ name, email, message }: IContactDetails) {
  return `
    Received an Email. 📬
    Sent from:
        👤 ${name}
        ${message}
  `;
}
