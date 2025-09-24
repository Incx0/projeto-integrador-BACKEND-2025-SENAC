//importsss
import userService from "../services/user.service.js";
import { Request, Response } from "express";

const userController = {
    //métodos do controller de user devem ser adicionados aqui
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await userService.getAllUsersService();
            res.json(users);
        } catch (error) {
            if(error instanceof Error){
                console.error('Erro ao buscar usuários: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }
    },
    getUser: async (req: Request, res: Response) => {
        try {
            const user = await userService.getUserService(req.body.id);
            res.json(user);
        } catch (error) {
            if(error instanceof Error){
                console.error('Erro ao buscar usuário: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }
    },
    addUser: async(req: Request, res: Response) =>{
        try{
            const result = await userService.addUserService(req.body);

            if(result.error){
                return res.status(400).json(result);
            }
            res.status(201).json(result)
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao adicionar usuário: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    },
    updateUser: async(req: Request, res: Response) =>{
        try{
            const result = await userService.updateUserService(req.body);

            if(result.error){
                return res.status(400).json(result);
            }
            res.json(result)
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao atualizar usuário: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    },
    alterarSenha: async(req: Request, res: Response) =>{
        try{
            const result = await userService.alterarSenhaService(req.body);

            if(result.error){
                return res.status(400).json(result);
            }
            res.json(result)
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao recuperar senha: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    },
    recuperarSenha: async(req: Request, res: Response) =>{
        try{
            const { email } = req.body;
            const result = await userService.recuperarSenhaService(email);
            const message = {message:'caso exista, email enviado'};

            if(!result) return res.status(400).json(message);
            if(result.error)return res.status(400).json(message);
            

            res.status(200).json(message);
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao recuperar senha: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    }
};
export default userController;