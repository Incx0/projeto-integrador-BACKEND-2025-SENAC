// email.middleware.ts
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY não definida no ambiente");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  try {
    const data = await resend.emails.send({
      from: "FilaMed <noreply@filamed.com>",
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text,
    });

    console.log("📧 Email enviado com sucesso:", data);
    return { success: true, data };
  } catch (err: any) {
    console.error("Erro ao enviar email:", err);
    return { success: false, error: err.message || err };
  }
};
