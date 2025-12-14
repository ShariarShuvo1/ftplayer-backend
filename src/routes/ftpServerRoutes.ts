import express, { Router } from "express";
import {
	createFtpServer,
	getAllFtpServers,
	getFtpServerById,
	updateFtpServer,
	deleteFtpServer,
} from "../controllers/ftpServerController";
import { authenticate } from "../middlewares/authMiddleware";

const router: Router = express.Router();

router.post("/", authenticate, createFtpServer);
router.get("/", authenticate, getAllFtpServers);
router.get("/:id", authenticate, getFtpServerById);
router.put("/:id", authenticate, updateFtpServer);
router.delete("/:id", authenticate, deleteFtpServer);

export default router;
