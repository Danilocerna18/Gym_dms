import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, RESET_MAIL_FROM } = process.env;
export const transport = SMTP_HOST === "smtp.gmail.com" && Number(SMTP_PORT) === 465 &&
  SMTP_USER && SMTP_PASSWORD && RESET_MAIL_FROM
  ? nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT), secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD.replace(/\s/g, "") },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 30000,
    })
  : null;

