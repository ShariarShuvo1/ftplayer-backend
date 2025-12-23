import { Request, Response } from "express";
import mongoose from "mongoose";
import Comment, { IComment } from "../models/Comment.js";
import User from "../models/User.js";
import FtpServer from "../models/FtpServer.js";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const createComment = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const {
			ftpServerId,
			serverType,
			contentType,
			contentId,
			contentTitle,
			comment,
		} = req.body;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		if (
			!ftpServerId ||
			!serverType ||
			!contentType ||
			!contentId ||
			!contentTitle ||
			!comment
		) {
			res.status(400).json({
				message:
					"Please provide ftpServerId, serverType, contentType, contentId, contentTitle, and comment",
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(ftpServerId)) {
			res.status(400).json({ message: "Invalid FTP server ID" });
			return;
		}

		const ftpServer = await FtpServer.findById(ftpServerId);
		if (!ftpServer) {
			res.status(404).json({ message: "FTP server not found" });
			return;
		}

		const newComment = new Comment({
			userId,
			ftpServerId,
			serverType,
			contentType,
			contentId,
			contentTitle,
			comment: comment.trim(),
		});

		const savedComment = await newComment.save();
		const populatedComment = await Comment.findById(
			savedComment._id
		).populate("userId", "name email");

		res.status(201).json({
			message: "Comment created successfully",
			comment: populatedComment,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error creating comment",
		});
	}
};

export const getCommentsByContent = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { ftpServerId, contentId } = req.query;
		const { limit = "50", page = "1" } = req.query;

		if (!ftpServerId || !contentId) {
			res.status(400).json({
				message: "Please provide ftpServerId and contentId",
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(ftpServerId as string)) {
			res.status(400).json({ message: "Invalid FTP server ID" });
			return;
		}

		const limitNum = parseInt(limit as string, 10);
		const pageNum = parseInt(page as string, 10);
		const skip = (pageNum - 1) * limitNum;

		const filter: any = {
			ftpServerId,
			contentId,
		};

		const comments = await Comment.find(filter)
			.populate("userId", "name email")
			.sort({ createdAt: -1 })
			.limit(limitNum)
			.skip(skip);

		const total = await Comment.countDocuments(filter);

		res.status(200).json({
			message: "Comments retrieved successfully",
			comments,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				totalPages: Math.ceil(total / limitNum),
			},
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching comments",
		});
	}
};

export const getUserComments = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { limit = "50", page = "1" } = req.query;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		const limitNum = parseInt(limit as string, 10);
		const pageNum = parseInt(page as string, 10);
		const skip = (pageNum - 1) * limitNum;

		const comments = await Comment.find({ userId })
			.populate("userId", "name email")
			.sort({ createdAt: -1 })
			.limit(limitNum)
			.skip(skip);

		const total = await Comment.countDocuments({ userId });

		res.status(200).json({
			message: "User comments retrieved successfully",
			comments,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				totalPages: Math.ceil(total / limitNum),
			},
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching user comments",
		});
	}
};

export const updateComment = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { comment } = req.body;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		if (!comment || comment.trim().length === 0) {
			res.status(400).json({ message: "Please provide a valid comment" });
			return;
		}

		const existingComment = await Comment.findOne({
			_id: id,
			userId,
		});

		if (!existingComment) {
			res.status(404).json({
				message:
					"Comment not found or you don't have permission to edit it",
			});
			return;
		}

		existingComment.comment = comment.trim();
		await existingComment.save();

		const populatedComment = await Comment.findById(
			existingComment._id
		).populate("userId", "name email");

		res.status(200).json({
			message: "Comment updated successfully",
			comment: populatedComment,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating comment",
		});
	}
};

export const deleteComment = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		const comment = await Comment.findOne({
			_id: id,
			userId,
		});

		if (!comment) {
			res.status(404).json({
				message:
					"Comment not found or you don't have permission to delete it",
			});
			return;
		}

		await Comment.deleteOne({ _id: id });

		res.status(200).json({
			message: "Comment deleted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error deleting comment",
		});
	}
};
