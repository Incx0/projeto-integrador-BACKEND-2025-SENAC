//imports do service e express
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {

  //metodo de login
  static async login(req: Request, res: Response) {
    const { login, senha } = req.body;

    try {
      // chamando e puxando informações do service
      const loginInfo = await authService.login(login, senha);

      // validação do service
      if (!loginInfo) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // retorna as info necessárias para o front
      return res.status(202).json({
        message: "Login realizado com sucesso",
        token: loginInfo.token,
        nome: loginInfo.nome,
        usuario: loginInfo.usuario,
        email: loginInfo.email,
        is_master_admin: loginInfo.is_master_admin
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao realizar login", error });
    }
  }


  //metodo de logout
  static async logout(req: Request, res: Response) {
    try {
      // trazendo o token do headers 
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      // validação do token
      if (!token) return res.status(400).json({ message: "Token não informado" });

      // chamando o service
      await authService.logout(token);

      return res.status(202).json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao realizar logout", error });
    }
  }


  //metodo de validar o token
  static async validarToken(req: Request, res: Response) {
    try {
      // trazendo o token do headers 
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      // validação do token
      if (!token) return res.status(401).json({ message: "Token não informado" });

      // chamando o service
      const validToken = await authService.validarToken(token);

      // validação do service
      if (!validToken) {
        return res.status(401).json({ message: "Token inválido" });
      }

      // retorna sucesso
      return res.status(202).json({ message: "Token válido" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao validar token", error });
    }
  }
}