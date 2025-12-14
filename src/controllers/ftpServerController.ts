import { Request, Response } from "express";
import FtpServer from "../models/FtpServer";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const createFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { name, description, pingUrl, uiUrl, childServers, ispProvider } =
			req.body;
		const userId = req.userId;

		if (!name || !pingUrl || !uiUrl || !ispProvider) {
			res.status(400).json({
				message: "Please provide name, pingUrl, uiUrl, and ispProvider",
			});
			return;
		}

		const newServer = new FtpServer({
			userId,
			name,
			description,
			pingUrl,
			uiUrl,
			childServers: childServers || [],
			ispProvider,
		});

		const savedServer = await newServer.save();

		res.status(201).json({
			message: "FTP server created successfully",
			server: savedServer,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error creating FTP server",
		});
	}
};

export const getAllFtpServers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		const servers = await FtpServer.find({ userId });

		res.status(200).json({
			servers,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching FTP servers",
		});
	}
};

export const getFtpServerById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const server = await FtpServer.findOne({ _id: id, userId });

		if (!server) {
			res.status(404).json({
				message: "FTP server not found",
			});
			return;
		}

		res.status(200).json({
			server,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching FTP server",
		});
	}
};

export const updateFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.userId;
		const { name, description, pingUrl, uiUrl, childServers, ispProvider } =
			req.body;

		const server = await FtpServer.findOne({ _id: id, userId });

		if (!server) {
			res.status(404).json({
				message: "FTP server not found",
			});
			return;
		}

		if (name !== undefined) server.name = name;
		if (description !== undefined) server.description = description;
		if (pingUrl !== undefined) server.pingUrl = pingUrl;
		if (uiUrl !== undefined) server.uiUrl = uiUrl;
		if (childServers !== undefined) server.childServers = childServers;
		if (ispProvider !== undefined) server.ispProvider = ispProvider;

		const updatedServer = await server.save();

		res.status(200).json({
			message: "FTP server updated successfully",
			server: updatedServer,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating FTP server",
		});
	}
};

export const deleteFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const server = await FtpServer.findOneAndDelete({ _id: id, userId });

		if (!server) {
			res.status(404).json({
				message: "FTP server not found",
			});
			return;
		}

		res.status(200).json({
			message: "FTP server deleted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error deleting FTP server",
		});
	}
};
