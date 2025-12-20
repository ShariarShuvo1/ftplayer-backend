import express, { Router } from "express";
import {
	createFtpServer,
	getAllFtpServers,
	getAllPublicFtpServers,
	getFtpServerById,
	updateFtpServer,
	deleteFtpServer,
	getServerTypes,
} from "../controllers/ftpServerController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/types", authenticate, getServerTypes);
router.post("/", authenticate, createFtpServer);
router.get("/", authenticate, getAllFtpServers);
router.get("/all-public", authenticate, getAllPublicFtpServers);
router.get("/:id", authenticate, getFtpServerById);
router.put("/:id", authenticate, updateFtpServer);
router.delete("/:id", authenticate, deleteFtpServer);

export default router;
