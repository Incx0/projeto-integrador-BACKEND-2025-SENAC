import userController from "../controllers/user.controller";
import { Router } from "express";
const router = Router();

router.get("/", userController.getAllUsers);
// Outros endpoints relacionados a usuários podem ser adicionados aqui
export default router;