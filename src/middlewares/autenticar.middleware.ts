//muitos imports
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

//funcao de autenticação
export const autenticar = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token não informado" });

  const funcionario = await authService.validarToken(token);

  if (!funcionario) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  (req as any).funcionario = funcionario;
  next();
};
