import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User.js";
import FtpServer from "../models/FtpServer.js";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const getWorkingFtpServers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		const user = await User.findById(userId).populate("workingFtpServers");

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({
			message: "Working FTP servers retrieved successfully",
			workingFtpServers: user.workingFtpServers,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching working FTP servers",
		});
	}
};

export const addWorkingFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { ftpServerId } = req.body;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		if (!ftpServerId) {
			res.status(400).json({ message: "Please provide ftpServerId" });
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

		const user = (await User.findById(userId)) as IUser | null;
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const serverId = new mongoose.Types.ObjectId(ftpServerId);
		if (user.workingFtpServers.includes(serverId)) {
			res.status(400).json({
				message: "FTP server is already in your working list",
			});
			return;
		}

		user.workingFtpServers.push(serverId);
		await user.save();

		const updatedUser = await User.findById(userId).populate(
			"workingFtpServers"
		);

		res.status(200).json({
			message: "FTP server added to working list successfully",
			workingFtpServers: updatedUser?.workingFtpServers,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error adding FTP server to working list",
		});
	}
};

export const removeWorkingFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { ftpServerId } = req.body;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		if (!ftpServerId) {
			res.status(400).json({ message: "Please provide ftpServerId" });
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(ftpServerId)) {
			res.status(400).json({ message: "Invalid FTP server ID" });
			return;
		}

		const user = (await User.findById(userId)) as IUser | null;
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const serverId = new mongoose.Types.ObjectId(ftpServerId);
		const initialLength = user.workingFtpServers.length;

		user.workingFtpServers = user.workingFtpServers.filter(
			(id) => !id.equals(serverId)
		);

		if (user.workingFtpServers.length === initialLength) {
			res.status(404).json({
				message: "FTP server not found in working list",
			});
			return;
		}

		await user.save();

		const updatedUser = await User.findById(userId).populate(
			"workingFtpServers"
		);

		res.status(200).json({
			message: "FTP server removed from working list successfully",
			workingFtpServers: updatedUser?.workingFtpServers,
		});
	} catch (error: any) {
		res.status(500).json({
			message:
				error.message || "Error removing FTP server from working list",
		});
	}
};

export const updateWorkingFtpServers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { ftpServerIds } = req.body;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		if (!Array.isArray(ftpServerIds)) {
			res.status(400).json({
				message: "Please provide ftpServerIds as an array",
			});
			return;
		}

		for (const id of ftpServerIds) {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				res.status(400).json({
					message: `Invalid FTP server ID: ${id}`,
				});
				return;
			}
		}

		const existingServers = await FtpServer.find({
			_id: { $in: ftpServerIds },
		});

		if (existingServers.length !== ftpServerIds.length) {
			res.status(404).json({
				message: "One or more FTP servers not found",
			});
			return;
		}

		const user = (await User.findById(userId)) as IUser | null;
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		user.workingFtpServers = ftpServerIds.map(
			(id: string) => new mongoose.Types.ObjectId(id)
		);
		await user.save();

		const updatedUser = await User.findById(userId).populate(
			"workingFtpServers"
		);

		res.status(200).json({
			message: "Working FTP servers updated successfully",
			workingFtpServers: updatedUser?.workingFtpServers,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating working FTP servers",
		});
	}
};

export const clearWorkingFtpServers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		const user = (await User.findById(userId)) as IUser | null;
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		user.workingFtpServers = [];
		await user.save();

		res.status(200).json({
			message: "Working FTP servers cleared successfully",
			workingFtpServers: [],
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error clearing working FTP servers",
		});
	}
};
