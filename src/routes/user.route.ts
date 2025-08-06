import userController from "../controllers/user.controller";
import { Router } from "express";
const router = Router();

router.get("/", userController.getAllUsers);
router.post("/get-user", userController.getUser);
// Outros endpoints relacionados a usuários podem ser adicionados aqui
export default router;