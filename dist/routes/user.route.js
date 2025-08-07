import userController from "../controllers/user.controller.js";
import { Router } from "express";
const router = Router();
router.get("/", userController.getAllUsers);
router.post("/get-user", userController.getUser);
router.post("/add-user", userController.addUser);
// Outros endpoints relacionados a usuários podem ser adicionados aqui
export default router;
