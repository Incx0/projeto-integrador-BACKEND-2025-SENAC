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

    if (!token) return res.status(400).json({ message: "Token não informado" });

    await authService.validarToken(token);
    return res.json({ message: "token válido" });
  }
}