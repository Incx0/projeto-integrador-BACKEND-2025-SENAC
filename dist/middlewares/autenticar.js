import { AuthService } from "../services/auth.service";
const authService = new AuthService();
export const autenticar = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Token não informado" });
    const funcionario = await authService.validarToken(token);
    if (!funcionario) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
    req.funcionario = funcionario;
    next();
};
