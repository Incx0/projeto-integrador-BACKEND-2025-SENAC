//import userService from "../services/user.service";
import userService from "../services/user.service";
import { Request, Response } from "express";

const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuários", error });
    }
    }
    // Outros métodos do controlador de usuário podem ser adicionados aqui
};
export default userController;