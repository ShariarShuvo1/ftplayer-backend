import { Request, Response } from "express";
import FtpServer, { ServerType } from "../models/FtpServer.js";
import {
	getServerTypeConfig,
	SERVER_TYPE_REGISTRY,
	getServerCapabilities,
} from "../services/serverTypeRegistry.js";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const getServerTypes = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const serverTypes = Object.entries(SERVER_TYPE_REGISTRY).map(
			([type, config]) => ({
				type,
				name: type
					.replace(/_/g, " ")
					.split(" ")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				baseUrl: config.baseUrl,
				imageBaseUrl: config.imageConfig.baseUrl,
				capabilities: config.capabilities,
				contentTypes: config.contentTypes,
				endpoints: Object.keys(config.endpoints),
			})
		);

		res.status(200).json({
			message: "Server types retrieved successfully",
			serverTypes,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching server types",
		});
	}
};

export const createFtpServer = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {
			name,
			description,
			serverType,
			ispProvider,
			pingUrl,
			uiUrl,
			priority,
		} = req.body;
		const userId = req.userId;

		if (!name || !serverType || !ispProvider) {
			res.status(400).json({
				message: "Please provide name, serverType, and ispProvider",
			});
			return;
		}

		if (!Object.values(ServerType).includes(serverType as ServerType)) {
			res.status(400).json({
				message: `Invalid server type. Valid types: ${Object.values(
					ServerType
				).join(", ")}`,
			});
			return;
		}

		const existingServer = await FtpServer.findOne({
			userId,
			serverType: serverType as ServerType,
			name,
		});

		if (existingServer) {
			res.status(400).json({
				message:
					"A server with this name and type already exists for your account",
			});
			return;
		}

		const config = getServerTypeConfig(serverType as ServerType);

		const newServer = new FtpServer({
			userId,
			name,
			description,
			serverType: serverType as ServerType,
			config,
			ispProvider,
			pingUrl,
			uiUrl,
			priority: priority || 0,
			isActive: true,
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
		const { isActive, serverType } = req.query;

		const filter: any = { userId };

		if (isActive !== undefined) {
			filter.isActive = isActive === "true";
		}

		if (serverType) {
			if (!Object.values(ServerType).includes(serverType as ServerType)) {
				res.status(400).json({
					message: "Invalid server type filter",
				});
				return;
			}
			filter.serverType = serverType;
		}

		const servers = await FtpServer.find(filter).sort({
			priority: -1,
			createdAt: -1,
		});

		res.status(200).json({
			message: "Servers retrieved successfully",
			count: servers.length,
			servers,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error fetching FTP servers",
		});
	}
};

export const getAllPublicFtpServers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { isActive, serverType } = req.query;

		const filter: any = {};

		if (isActive !== undefined) {
			filter.isActive = isActive === "true";
		}

		if (serverType) {
			if (!Object.values(ServerType).includes(serverType as ServerType)) {
				res.status(400).json({
					message: "Invalid server type filter",
				});
				return;
			}
			filter.serverType = serverType;
		}

		const servers = await FtpServer.find(filter).sort({
			priority: -1,
			createdAt: -1,
		});

		res.status(200).json({
			message: "All FTP servers retrieved successfully",
			count: servers.length,
			ftpServers: servers,
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

		const capabilities = getServerCapabilities(server.serverType);

		res.status(200).json({
			message: "Server retrieved successfully",
			server: {
				...server.toObject(),
				capabilities,
			},
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
		const {
			name,
			description,
			ispProvider,
			pingUrl,
			uiUrl,
			priority,
			isActive,
		} = req.body;

		const server = await FtpServer.findOne({ _id: id, userId });

		if (!server) {
			res.status(404).json({
				message: "FTP server not found",
			});
			return;
		}

		if (name !== undefined) {
			const existingServer = await FtpServer.findOne({
				userId,
				serverType: server.serverType,
				name,
				_id: { $ne: id },
			});

			if (existingServer) {
				res.status(400).json({
					message: "A server with this name already exists",
				});
				return;
			}
			server.name = name;
		}

		if (description !== undefined) server.description = description;
		if (ispProvider !== undefined) server.ispProvider = ispProvider;
		if (pingUrl !== undefined) server.pingUrl = pingUrl;
		if (uiUrl !== undefined) server.uiUrl = uiUrl;
		if (priority !== undefined) server.priority = priority;
		if (isActive !== undefined) server.isActive = isActive;

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
			server: {
				id: server._id,
				name: server.name,
				serverType: server.serverType,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error deleting FTP server",
		});
	}
};
