//importsss do service e express
import hospitalService from "../services/hospital.service.js";
import { Request, Response } from "express";

const userController = {
    //metodo de get de tds os hospitais
    getAllhospitais: async (req: Request, res: Response) => {
        try {
            const hospitais = await hospitalService.getAllHospitaisService();
            res.json(hospitais);
        } catch (error) {
            if(error instanceof Error){
                console.error('Erro ao buscar hospitais: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }
    },

    //metodo de get de um hospital por id
    getHospital: async (req: Request, res: Response) => {
        try {
            const hospital = await hospitalService.getHospitalService(req.body.id);
            res.json(hospital);
        } catch (error) {
            if(error instanceof Error){
                console.error('Erro ao buscar hospital: ', error.message);
            }else{
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({error:'Erro interno do server'});
        }
    },

    //metodo de add hospital
    addHospital: async (req: Request, res: Response) => {
        //nn sei como a foto ta pegando, mas nn mexe
        try {
            const { nome, lati, long, uf, cidade, logradouro, bairro} = req.body;
            
            let fotoBase64 = null;
            if (req.file && req.file.buffer) {
                fotoBase64 = req.file.buffer.toString('base64');
            }
      
            const result = await hospitalService.addHospitalService({
                nome,
                lati,
                long,
                uf,
                cidade,
                logradouro,
                bairro,
                foto: fotoBase64
            });
      
            if (result.error) {
                return res.status(400).json(result);
            }
      
            res.json(result);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro ao adicionar hospital: ", error.message);
            } else {
                console.error("Erro desconhecido: ", error);
            }
            res.status(500).json({ error: "Erro interno do server" });
        }
    },

    //metodo de dar update em um hospital, somente os campos enviados no body
    updateHospital: async (req: Request, res: Response) => {
        try {
            const foto = req.file ? req.file.buffer : null;
      
            const result = await hospitalService.updateHospitalService({
                ...req.body,
                foto
            });
      
            if (result.error) {
                return res.status(400).json(result);
            }
      
            res.json(result);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro ao atualizar hospital: ", error.message);
            } else {
                console.error("Erro desconhecido: ", error);
            }
            res.status(500).json({ error: "Erro interno do server" });
        }
    },

    //delete de hospital por id
    deleteHospital: async(req: Request, res: Response) =>{
        try{
            const result = await hospitalService.deleteHospitalService(req.body.id);

            if(result.error){
                return res.status(400).json(result);
            }
            res.json(result)
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

//export do controller do hospital
export default userController;