//import userService from "../services/user.service";
import userService from "../services/user.service";
import { Request, Response } from "express";

const userController = {
    //métodos do controlador de usuário devem ser adicionados aqui
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar usuários", error });
        }
    },
    getUser: async(req: Request, res: Response) =>{
        try{
            const user = await userService.getUser(req.body);
            res.json(user);
        }catch (error) {
            res.status(500).json({ message: "Usuário não encontrado", error});
        }
    }
};
export default userController;