//imports do service e express
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {

  //metodo de login
  static async login(req: Request, res: Response) {
    const { login, senha } = req.body;
    const loginInfo = await authService.login(login, senha);

    if (!loginInfo) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    return res.status(202).json({
      message: "Login realizado com sucesso",
      token: loginInfo.token,
      nome : loginInfo.nome,
      usuario: loginInfo.usuario,
      email: loginInfo.email
    });
  }

  //metodo de logout
  static async logout(req: Request, res: Response) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(400).json({ message: "Token não informado" });

    await authService.logout(token);
    return res.status(202).json({ message: "Logout realizado com sucesso" });
  }

  //metodo de validar o token
  static async validarToken(req: Request, res: Response) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // Status 401 é mais apropriado para falha de autenticação do que 400
        return res.status(401).json({ message: "Token não fornecido" });
    }

    try {
        // 1. Tenta validar o token.
        // Se a validação falhar (ex: token inválido/expirado), o authService deve Lançar um erro (throw new Error()).
        await authService.validarToken(token);

        // 2. Se o código chegar aqui, significa que o token é válido.
        return res.status(202).json({ message: "Token válido" });

    } catch (error) {
        // 3. Se o authService lançar um erro (catch), o token é inválido.
        console.error("Erro na validação do token:", error);

        // Status 401 (Unauthorized) é o padrão para tokens inválidos/expirados.
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  }
}