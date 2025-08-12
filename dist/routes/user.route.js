//import do controller de usuário
import userController from "../controllers/user.controller.js";
//import do Router do express
import { Router } from "express";
const router = Router();
router.get("/", userController.getAllUsers);
router.post("/get-user", userController.getUser);
router.post("/add-user", userController.addUser);
export default router;
