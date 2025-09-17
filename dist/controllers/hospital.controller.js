//importsss
import hospitalService from "../services/hospital.service.js";
const userController = {
    //métodos do controller de user devem ser adicionados aqui
    getAllhospitais: async (req, res) => {
        try {
            const hospitais = await hospitalService.getAllHospitaisService();
            res.json(hospitais);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Erro ao buscar hospitais: ', error.message);
            }
            else {
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({ error: 'Erro interno do server' });
        }
    },
    getHospital: async (req, res) => {
        try {
            const hospital = await hospitalService.getHospitalService(req.body.id);
            res.json(hospital);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Erro ao buscar hospital: ', error.message);
            }
            else {
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({ error: 'Erro interno do server' });
        }
    },
    addHospital: async (req, res) => {
        //nn sei como a foto ta pegando, mas nn mexe
        try {
            const { nome, lati, long, uf, cidade, logradouro, bairro } = req.body;
            const foto = req.file ? req.file.buffer : null;
            const result = await hospitalService.addHospitalService({
                nome,
                lati,
                long,
                uf,
                cidade,
                logradouro,
                bairro,
                foto
            });
            if (result.error) {
                return res.status(400).json(result);
            }
            res.json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Erro ao adicionar hospital: ", error.message);
            }
            else {
                console.error("Erro desconhecido: ", error);
            }
            res.status(500).json({ error: "Erro interno do server" });
        }
    },
    updateHospital: async (req, res) => {
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
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Erro ao atualizar hospital: ", error.message);
            }
            else {
                console.error("Erro desconhecido: ", error);
            }
            res.status(500).json({ error: "Erro interno do server" });
        }
    },
    deleteHospital: async (req, res) => {
        try {
            const result = await hospitalService.deleteHospitalService(req.body.id);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Erro ao deletar hospital: ', error.message);
            }
            else {
                console.error('Erro desconhecido: ', error);
            }
            res.status(500).json({ error: 'Erro interno do server' });
        }
    }
};
export default userController;
