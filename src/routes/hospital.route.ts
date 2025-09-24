//import do controller de hospital
import hospitalController from "../controllers/hospital.controller.js";

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
router.post("/add-hospital", upload.single("foto"), hospitalController.addHospital);
router.post("/update", upload.single("foto"), hospitalController.updateHospital);
router.delete("/delete-hospital", hospitalController.deleteHospital);

//exportando o router 
export default router;