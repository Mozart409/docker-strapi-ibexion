exports.handler = async (event: object, context: any) => {
  console.log("SECRET_NAME 👉", process.env.SECRET_NAME);
  console.log("SECRET_VALUE 👉", process.env.SECRET_VALUE);

  const res = JSON.parse(`${process.env.SECRET_VALUE}`);

  return { body: JSON.stringify({ message: "SUCCESS" }), statusCode: 200 };
};
