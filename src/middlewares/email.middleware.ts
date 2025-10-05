import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Verificação das variáveis do .env
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
  throw new Error("GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET ou GMAIL_REFRESH_TOKEN não estão definidos no .env");
}

// Configuração OAuth2
const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  "http://localhost:3000"
);

// Setando o refresh token
oAuth2Client.setCredentials({
  refresh_token: GMAIL_REFRESH_TOKEN,
});

// Criando cliente Gmail
const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Função para gerar email em base64
const makeEmailBody = (to: string, subject: string, text: string, html?: string) => {
  const body = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html || `<p>${text}</p>`,
  ].join("\n");

  return Buffer.from(body)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// Middleware de envio de email
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const raw = makeEmailBody(to, subject, text, html);
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("Email enviado com sucesso!");
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao enviar email via Gmail API:", err.response?.data || err.message || err);
    return { success: false, error: err };
  }
};
