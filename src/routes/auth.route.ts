//import do controller de autenticacao e router
import { Router } from "express";

//tentiva ruim de usar classe
import  {AuthController}  from "../controllers/auth.controller.js";

//declarando o router
const router = Router();

//rotas exemplo("/auth/login")
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/validar-token", AuthController.validarToken);

//export do router
export default router;