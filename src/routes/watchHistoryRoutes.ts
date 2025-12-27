import express, { Router } from "express";
import {
	updateWatchProgress,
	updateContentStatus,
	updateEpisodeStatus,
	getWatchHistory,
	getWatchHistoryById,
	getContentWatchHistory,
	deleteWatchHistory,
	deleteEpisodeFromWatchHistory,
	getWatchStats,
} from "../controllers/watchHistoryController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.post("/progress", authenticate, updateWatchProgress);
router.put("/status/:id", authenticate, updateContentStatus);
router.put("/episode-status/:id", authenticate, updateEpisodeStatus);
router.get("/", authenticate, getWatchHistory);
router.get("/stats", authenticate, getWatchStats);
router.get("/content", authenticate, getContentWatchHistory);
router.get("/:id", authenticate, getWatchHistoryById);
router.delete("/:id/episode", authenticate, deleteEpisodeFromWatchHistory);
router.delete("/:id", authenticate, deleteWatchHistory);

export default router;
