import { AuthService } from "../services/auth.service.js";
const authService = new AuthService();
export class AuthController {
    static async login(req, res) {
        const { usuario, email, senha } = req.body;
        const login = await authService.login(usuario || email, senha);
        if (!login) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }
        return res.json({
            message: "Login realizado com sucesso",
            token: login.token,
            funcionario: login.user
        });
    }
    static async logout(req, res) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token)
            return res.status(400).json({ message: "Token não informado" });
        await authService.logout(token);
        return res.json({ message: "Logout realizado com sucesso" });
    }
    static async validarToken(req, res) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token)
            return res.status(400).json({ message: "Token não informado" });
        await authService.validarToken(token);
        return res.json({ message: "Logout realizado com sucesso" });
    }
}
