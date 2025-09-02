import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
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
export const sendMail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: `"LineMed" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        return { success: true };
    }
    catch (err) {
        console.error("Erro ao enviar email:", err);
        return { success: false, error: err };
    }
};
