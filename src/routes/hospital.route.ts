//import do controller de hospital
import hospitalController from "../controllers/hospital.controller.js";

import { autenticar } from "../middlewares/autenticar.middleware.js";

//import do Router do express
import { Router } from "express";
const router = Router();

//import do Multer para tratar a imagem
import multer from "multer";
const upload = multer();

//rotas exemplo("/hospital/add-hospital")
router.get("/", hospitalController.getAllhospitais);
router.get("/all", hospitalController.getAllhospitais);
router.get("/get-hospital", hospitalController.getHospital);
router.post("/update-fila", hospitalController.updateFilaHospital);
router.post("/remove-from-fila", hospitalController.updateRemoveFromFilaHospital);
router.post("/add-hospital", autenticar, upload.single("foto"), hospitalController.addHospital);
router.post("/update", autenticar, upload.single("foto"), hospitalController.updateHospital);
router.post("/delete-hospital", autenticar, hospitalController.deleteHospital);

//exportando o router 
export default router;