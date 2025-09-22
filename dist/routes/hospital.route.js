//import do controller de usuário
import hospitalController from "../controllers/hospital.controller.js";
//import do Router do express
import { Router } from "express";
const router = Router();
import multer from "multer";
const upload = multer();
router.get("/", hospitalController.getAllhospitais);
router.get("/get-hospital", hospitalController.getHospital);
router.post("/add-hospital", upload.single("foto"), hospitalController.addHospital);
router.post("/update", upload.single("foto"), hospitalController.updateHospital);
router.delete("/delete-hospital", hospitalController.deleteHospital);
export default router;
