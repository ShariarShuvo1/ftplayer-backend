import express, { Router } from "express";
import {
	createComment,
	getCommentsByContent,
	getUserComments,
	updateComment,
	deleteComment,
} from "../controllers/commentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.post("/", authenticate, createComment);
router.get("/content", getCommentsByContent);
router.get("/user", authenticate, getUserComments);
router.put("/:id", authenticate, updateComment);
router.delete("/:id", authenticate, deleteComment);

export default router;
