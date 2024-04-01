import nodemailer from "nodemailer";

const emailRegister = async (data) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, name, token } = data;

  //Send email
  await transport.sendMail({
    from: "calliving.com",
    to: email,
    subject: "Confirma tu cuenta en calliving.com",
    text: "Confirma tu cuenta en calliving.com",
    html: `
      <p>Hola ${name}, comprueba tu cuenta en calliving.com</p>

      <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
      <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/confirm/${token}">Confirmar cuenta</a> </p>

      <p>Si tu no creaste esta cuenta, ignora este mensaje</p>
    `,
  });
};

const emailForgotPassword = async (data) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, name, token } = data;

  //Send email
  await transport.sendMail({
    from: "calliving.com",
    to: email,
    subject: "Reestablece tu password en calliving.com",
    text: "Reestablece tu password en calliving.com",
    html: `
      <p>Hola ${name}, has solicitado reestablecer tu password en calliving.com</p>

      <p>Sigue el siguiente enlace para generar un password nuevo:
      <a href="${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/forgot-password/${token}">Reestablecer contraseña</a> </p>

      <p>Si tu no solicitaste el cambio de contraseña, ignora este mensaje</p>
    `,
  });
};

export { emailRegister, emailForgotPassword };
