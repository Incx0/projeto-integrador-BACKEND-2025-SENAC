//import do controller de usuário
import userController from "../controllers/user.controller.js";

import { autenticar } from "../middlewares/autenticar.middleware.js";

//import do Router do express
import { Router } from "express";
const router = Router();


//rotas exemplo("/user/add-user")
router.get("/", autenticar, userController.getAllUsers);
router.get("/all", autenticar, userController.getAllUsers);
router.get("/get-user", autenticar,userController.getUser);
router.post("/add-user", autenticar,userController.addUser);
router.post("/update-user", autenticar,userController.updateUser);
router.post("/delete-user", autenticar,userController.deleteUser);

//rotas de recuperação de senha
router.post("/alterar-senha", userController.alterarSenha);
router.post("/enviar-recuperar-senha", userController.recuperarSenha);

//exportando o router
export default router;