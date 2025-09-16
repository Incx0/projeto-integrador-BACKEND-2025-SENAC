import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("User:", process.env.EMAIL_USER);
console.log("Pass:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

// função para enviar email
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    await transporter.sendMail({
      from: `"noreply" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return { success: false, error: err };
  }
};
