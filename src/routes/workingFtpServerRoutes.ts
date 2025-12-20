import express, { Router } from "express";
import {
	getWorkingFtpServers,
	addWorkingFtpServer,
	removeWorkingFtpServer,
	updateWorkingFtpServers,
	clearWorkingFtpServers,
} from "../controllers/workingFtpServerController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/", authenticate, getWorkingFtpServers);
router.post("/add", authenticate, addWorkingFtpServer);
router.post("/remove", authenticate, removeWorkingFtpServer);
router.put("/", authenticate, updateWorkingFtpServers);
router.delete("/", authenticate, clearWorkingFtpServers);

export default router;
