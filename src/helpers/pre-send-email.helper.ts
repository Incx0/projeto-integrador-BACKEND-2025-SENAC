import { sendMail } from "../middlewares/email.middleware.js";

/**
 * Envia o e-mail de recuperação de senha ao usuário.
 * Usa Resend (configurado em email.middleware.ts).
 */
export async function sendRecupCodeEmail(
  email: string,
  nome: string,
  recupCode: string
) {
  const resetLink = `https://filamed.com/alteracao-senha/${recupCode}`; // ou teu link de frontend

  const html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Redefinição de Senha - FilaMed</title>
      <style>
          @media (prefers-color-scheme: dark) {
              .email-body { background-color: #1a1a1a !important; }
              .email-container { background-color: #2d2d2d !important; color: #f0f0f0 !important; }
              .email-header { background-color: #0a1c3a !important; }
              .email-content { background-color: #2d2d2d !important; color: #f0f0f0 !important; }
              .email-footer { background-color: #0a1c3a !important; }
              .highlight-box { background-color: #1a2d4d !important; color: #f0f0f0 !important; }
              .email-content h1, .email-content h2 { color: #a0c5ff !important; }
              .email-content p { color: #e0e0e0 !important; }
          }
      </style>
  </head>
  <body class="email-body" style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f9fc;">
          <tr>
              <td align="center" style="padding: 30px 0;">

                  <!-- Header -->
                  <table width="600" cellpadding="0" cellspacing="0" border="0" class="email-header" style="background-color: #0e2b52; border-radius: 12px 12px 0 0; box-shadow: 0 2px 15px rgba(14, 43, 82, 0.1);">
                      <tr>
                          <td align="center" style="padding: 40px 0 30px 0;">
                              <img src="https://i.imgur.com/R5M9JNV.png" alt="Logo FilaMed" style="display: block; max-width: 400px;">
                          </td>
                      </tr>
                  </table>

                  <!-- Conteúdo principal -->
                  <table width="600" cellpadding="0" cellspacing="0" border="0" class="email-content" style="background-color: #ffffff; box-shadow: 0 2px 15px rgba(14, 43, 82, 0.1);">
                      <tr>
                          <td style="padding: 30px;">
                              <h1 style="color: #0e2b52; margin-top: 0; font-size: 26px; text-align: center;">Olá, ${nome} 👋</h1>
                              <p style="color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">Recebemos sua solicitação para redefinir a senha. Clique no botão abaixo:</p>

                              <div style="text-align: center; margin: 30px 0;">
                                  <a href="${resetLink}" style="display: inline-block; background-color: #0e2b52; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 43, 82, 0.2);">
                                      Redefinir Senha
                                  </a>
                              </div>

                              <p style="color: #666666; font-size: 15px; line-height: 1.6; text-align: center;">Este link expira em 24 horas.</p>
                              <p style="color: #999; font-size: 13px; text-align: center;">Se você não pediu uma nova senha, ignore este e-mail.</p>
                          </td>
                      </tr>
                  </table>

                  <!-- Rodapé -->
                  <table width="600" cellpadding="0" cellspacing="0" border="0" class="email-footer" style="background-color: #0e2b52; border-radius: 0 0 12px 12px; box-shadow: 0 2px 15px rgba(14, 43, 82, 0.1);">
                      <tr>
                          <td align="center" style="padding: 25px 30px;">
                              <p style="color: #ffffff; font-size: 13px; margin: 0;">© 2025 FilaMed. Todos os direitos reservados.</p>
                          </td>
                      </tr>
                  </table>

              </td>
          </tr>
      </table>
  </body>
  </html>
  `;

  // Chama o middleware de envio de e-mail
  const result = await sendMail(
    email,
    "Recuperação de senha - FilaMed",
    `Olá ${nome}, use o link abaixo para redefinir sua senha.`,
    html
  );

  return result;
}
