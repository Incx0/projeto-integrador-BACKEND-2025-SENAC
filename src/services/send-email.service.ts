import { sendMail } from "../middlewares/email.middleware.js";

const sendEmailService = {
    sendEmailVerifyAccountService: async (email:string, nome:string, verifyCode: any) =>{
        await sendMail(
            email,
            "Bem-vindo 🚀",
            `Olá ${nome}, seu usuário foi criado com sucesso! valide a sua conta`,
            `<h3>Seu link de verificação se encontra abaixo:</h3>
             </br>
             <a>
                localhost:8100/verificar-conta/${verifyCode}
             </a>
            `
          );
    },

    sendRecupPasswordEmailService: async (email:string, nome:string, recupCode: any) =>{
        await sendMail(
            email,
            "Recuperação de senha",
            `Olá, seu usuário foi criado com sucesso! valide a sua conta`,
            `<h3>Alguém solicitou um link para recuperar a senha deste usuário em nossa plataforma, se não foi você ignore</h3>
             </br>
             <a>
                localhost:8100/verificar-conta/${recupCode}
             </a>
            `
          );
    }
}

export default sendEmailService;