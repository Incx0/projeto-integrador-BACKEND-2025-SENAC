//import do controller de usuário
import hospitalController from "../controllers/hospital.controller.js";
//import do Router do express
import { Router } from "express";
const router = Router();

router.get("/", hospitalController.getAllhospitais);
router.get("/get-hospital", hospitalController.getHospital);
router.post("/add-hospital", hospitalController.addHospital);
router.post("/update-hospital", hospitalController.updateHospital);
router.delete("/delete-hospital", hospitalController.deleteHospital);

export default router;