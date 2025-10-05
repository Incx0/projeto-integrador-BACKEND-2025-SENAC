//import do service e express
import userService from "../services/user.service.js";
import { Request, Response } from "express";

const userController = {
    //método de dar get em tds os usuários
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

    //método de dar get em 1 usuário por id
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
    //método de add um usuário
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
    //método de dar update em um usuário
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
    //método de alterar a senha de um usuário em específico
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
    //método de enviar o email pro usuário caso exista em nosso bd
    recuperarSenha: async(req: Request, res: Response) =>{
        try{
            const { email } = req.body;
            await userService.recuperarSenhaService(email);
            res.status(200).json({message:'Caso exista, email enviado'});
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao recuperar senha: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    },

    //delete de usuario por id
    deleteUser: async(req: Request, res: Response) =>{
        try{
            const result = await userService.deleteUserService(req.body.id);

            if(result.error) return res.status(400).json(result);
            if(!result) return res.status(400).json({error:"Erro ao deletar hospital"});
            res.status(202).json({message:"Deletado com sucesso"})
        }catch(error){
            if(error instanceof Error){
                console.error('Erro ao deletar hospital: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }

    }
};

//export do controller
export default userController;