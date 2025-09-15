import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
const router = Router();
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/validar-token", AuthController.logout);
export default router;
