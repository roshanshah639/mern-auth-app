import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: "gmail",
  auth: {
    user: "roshanshah639@gmail.com",
    pass: "snnp jqnj tsqy bzfx",
  },
});
