//import do controller de usuário
import userController from "../controllers/user.controller.js";

import { autenticar } from "../middlewares/autenticar.middleware.js";

//import do Router do express
import { Router } from "express";
const router = Router();

//"auth guard"
router.use(autenticar);

//rotas exemplo("/user/add-user")
router.get("/", userController.getAllUsers);
router.get("/all", userController.getAllUsers);
router.get("/get-user", userController.getUser);
router.post("/add-user", userController.addUser);
router.post("/update-user", userController.updateUser);
router.post("/alterar-senha", userController.alterarSenha);
router.post("/enviar-recuperar-senha", userController.recuperarSenha);
router.post("/delete-user", userController.deleteUser);

//exportando o router
export default router;