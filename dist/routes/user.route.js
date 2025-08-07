import userController from "../controllers/user.controller.js";
import { Router } from "express";
const router = Router();
router.get("/", userController.getAllUsers);
router.post("/get-user", userController.getUser);
router.post("/add-user", userController.addUser);
export default router;
