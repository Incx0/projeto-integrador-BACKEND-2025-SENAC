//import do controller de usuário
import userController from "../controllers/user.controller.js";
//import do Router do express
import { Router } from "express";
const router = Router();

router.get("/", userController.getAllUsers);
router.post("/add-user", userController.addUser);
router.post("/update-user", userController.updateUser);
router.post("/alterar-senha", userController.alterarSenha);
export default router;