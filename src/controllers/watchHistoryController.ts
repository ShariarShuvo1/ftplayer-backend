import { Request, Response } from "express";
import WatchHistory, { WatchStatus } from "../models/WatchHistory.js";
import { ContentType, ServerType } from "../models/FtpServer.js";
import mongoose from "mongoose";

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const updateWatchProgress = async (
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
			status,
			progress,
			seasonNumber,
			episodeNumber,
			episodeId,
			episodeTitle,
			metadata,
		} = req.body;

		if (!ftpServerId || !serverType || !contentType || !contentId) {
			res.status(400).json({
				message:
					"Please provide ftpServerId, serverType, contentType, and contentId",
			});
			return;
		}

		const isSeries =
			contentType === ContentType.SERIES ||
			contentType === ContentType.TV_SHOW;
		const isEpisodeUpdate =
			isSeries && seasonNumber != null && episodeNumber != null;

		let watchHistory = await WatchHistory.findOne({
			userId,
			ftpServerId,
			contentId,
		});

		if (!watchHistory) {
			watchHistory = new WatchHistory({
				userId,
				ftpServerId,
				serverType,
				contentType,
				contentId,
				contentTitle: contentTitle || "Untitled",
				status: WatchStatus.WATCHING,
				metadata,
				lastWatchedAt: new Date(),
			});
		}

		if (isEpisodeUpdate) {
			if (!watchHistory.seriesProgress) {
				watchHistory.seriesProgress = [];
			}

			let season = watchHistory.seriesProgress.find(
				(s) => s.seasonNumber === seasonNumber
			);

			if (!season) {
				season = {
					seasonNumber,
					episodes: [],
				};
				watchHistory.seriesProgress.push(season);
			}

			let episode = season.episodes.find(
				(e) => e.episodeNumber === episodeNumber
			);

			if (!episode) {
				episode = {
					episodeNumber,
					episodeId,
					episodeTitle,
					status: status || WatchStatus.WATCHING,
					progress: progress || {
						currentTime: 0,
						duration: 0,
						percentage: 0,
					},
					lastWatchedAt: new Date(),
				};
				season.episodes.push(episode);
			} else {
				if (status) episode.status = status;
				if (progress) {
					episode.progress = {
						...episode.progress,
						...progress,
					};
				}
				if (episodeTitle) episode.episodeTitle = episodeTitle;
				if (episodeId) episode.episodeId = episodeId;
				episode.lastWatchedAt = new Date();
			}

			season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

			if (status === WatchStatus.WATCHING) {
				watchHistory.status = WatchStatus.WATCHING;
			}
		} else {
			if (status) {
				watchHistory.status = status;
			}
			if (progress) {
				watchHistory.progress = {
					...(watchHistory.progress || {}),
					...progress,
				};
			}
		}

		watchHistory.lastWatchedAt = new Date();

		if (status === WatchStatus.COMPLETED && !watchHistory.completedAt) {
			watchHistory.completedAt = new Date();
		} else if (status && status !== WatchStatus.COMPLETED) {
			watchHistory.completedAt = undefined;
		}

		if (metadata) {
			watchHistory.metadata = {
				...(watchHistory.metadata || {}),
				...metadata,
			};
		}

		await watchHistory.save();

		res.status(200).json({
			message: "Watch progress updated successfully",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating watch progress",
		});
	}
};

export const updateContentStatus = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { status } = req.body;

		if (!status || !Object.values(WatchStatus).includes(status)) {
			res.status(400).json({
				message: `Invalid status. Valid statuses: ${Object.values(
					WatchStatus
				).join(", ")}`,
			});
			return;
		}

		const watchHistory = await WatchHistory.findOne({
			_id: id,
			userId,
		});

		if (!watchHistory) {
			res.status(404).json({
				message: "Watch history not found",
			});
			return;
		}

		watchHistory.status = status;
		watchHistory.lastWatchedAt = new Date();

		if (status === WatchStatus.COMPLETED && !watchHistory.completedAt) {
			watchHistory.completedAt = new Date();
		} else if (status !== WatchStatus.COMPLETED) {
			watchHistory.completedAt = undefined;
		}

		await watchHistory.save();

		res.status(200).json({
			message: "Content status updated successfully",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating content status",
		});
	}
};

export const updateEpisodeStatus = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { seasonNumber, episodeNumber, status } = req.body;

		if (seasonNumber == null || episodeNumber == null || !status) {
			res.status(400).json({
				message:
					"Please provide seasonNumber, episodeNumber, and status",
			});
			return;
		}

		if (!Object.values(WatchStatus).includes(status)) {
			res.status(400).json({
				message: `Invalid status. Valid statuses: ${Object.values(
					WatchStatus
				).join(", ")}`,
			});
			return;
		}

		const watchHistory = await WatchHistory.findOne({
			_id: id,
			userId,
		});

		if (!watchHistory) {
			res.status(404).json({
				message: "Watch history not found",
			});
			return;
		}

		const season = watchHistory.seriesProgress?.find(
			(s) => s.seasonNumber === seasonNumber
		);

		if (!season) {
			res.status(404).json({
				message: "Season not found",
			});
			return;
		}

		const episode = season.episodes.find(
			(e) => e.episodeNumber === episodeNumber
		);

		if (!episode) {
			res.status(404).json({
				message: "Episode not found",
			});
			return;
		}

		episode.status = status;
		episode.lastWatchedAt = new Date();
		watchHistory.lastWatchedAt = new Date();

		await watchHistory.save();

		res.status(200).json({
			message: "Episode status updated successfully",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error updating episode status",
		});
	}
};

export const getWatchHistory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const {
			status,
			contentType,
			serverType,
			ftpServerId,
			limit = "50",
			page = "1",
		} = req.query;

		const filter: any = { userId };

		if (
			status &&
			Object.values(WatchStatus).includes(status as WatchStatus)
		) {
			filter.status = status;
		}

		if (
			contentType &&
			Object.values(ContentType).includes(contentType as ContentType)
		) {
			filter.contentType = contentType;
		}

		if (
			serverType &&
			Object.values(ServerType).includes(serverType as ServerType)
		) {
			filter.serverType = serverType;
		}

		if (ftpServerId) {
			filter.ftpServerId = ftpServerId;
		}

		const limitNum = parseInt(limit as string);
		const pageNum = parseInt(page as string);
		const skip = (pageNum - 1) * limitNum;

		const watchHistories = await WatchHistory.find(filter)
			.populate("ftpServerId", "name serverType ispProvider")
			.sort({ lastWatchedAt: -1 })
			.limit(limitNum)
			.skip(skip);

		const total = await WatchHistory.countDocuments(filter);

		res.status(200).json({
			message: "Watch history retrieved successfully",
			watchHistories,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				pages: Math.ceil(total / limitNum),
			},
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error retrieving watch history",
		});
	}
};

export const getWatchHistoryById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;

		const watchHistory = await WatchHistory.findOne({
			_id: id,
			userId,
		}).populate("ftpServerId", "name serverType ispProvider");

		if (!watchHistory) {
			res.status(404).json({
				message: "Watch history not found",
			});
			return;
		}

		res.status(200).json({
			message: "Watch history retrieved successfully",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error retrieving watch history",
		});
	}
};

export const getContentWatchHistory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { ftpServerId, contentId } = req.query;

		if (!ftpServerId || !contentId) {
			res.status(400).json({
				message: "Please provide ftpServerId and contentId",
			});
			return;
		}

		const watchHistory = await WatchHistory.findOne({
			userId,
			ftpServerId,
			contentId,
		}).populate("ftpServerId", "name serverType ispProvider");

		res.status(200).json({
			message: watchHistory
				? "Content watch history retrieved successfully"
				: "No watch history found for this content",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error retrieving content watch history",
		});
	}
};

export const deleteWatchHistory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;

		const watchHistory = await WatchHistory.findOneAndDelete({
			_id: id,
			userId,
		});

		if (!watchHistory) {
			res.status(404).json({
				message: "Watch history not found",
			});
			return;
		}

		res.status(200).json({
			message: "Watch history deleted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error deleting watch history",
		});
	}
};

export const deleteEpisodeFromWatchHistory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { seasonNumber, episodeNumber } = req.body;

		if (seasonNumber == null || episodeNumber == null) {
			res.status(400).json({
				message: "Please provide seasonNumber and episodeNumber",
			});
			return;
		}

		const watchHistory = await WatchHistory.findOne({
			_id: id,
			userId,
		});

		if (!watchHistory) {
			res.status(404).json({
				message: "Watch history not found",
			});
			return;
		}

		if (!watchHistory.seriesProgress) {
			res.status(404).json({
				message: "No series progress found",
			});
			return;
		}

		const season = watchHistory.seriesProgress.find(
			(s) => s.seasonNumber === seasonNumber
		);

		if (!season) {
			res.status(404).json({
				message: "Season not found",
			});
			return;
		}

		const episodeIndex = season.episodes.findIndex(
			(e) => e.episodeNumber === episodeNumber
		);

		if (episodeIndex === -1) {
			res.status(404).json({
				message: "Episode not found",
			});
			return;
		}

		season.episodes.splice(episodeIndex, 1);

		if (season.episodes.length === 0) {
			const seasonIndex = watchHistory.seriesProgress.findIndex(
				(s) => s.seasonNumber === seasonNumber
			);
			watchHistory.seriesProgress.splice(seasonIndex, 1);
		}

		if (watchHistory.seriesProgress.length === 0) {
			await WatchHistory.findByIdAndDelete(id);
			res.status(200).json({
				message: "Series watch history deleted (no episodes remaining)",
			});
			return;
		}

		await watchHistory.save();

		res.status(200).json({
			message: "Episode deleted successfully",
			watchHistory,
		});
	} catch (error: any) {
		res.status(500).json({
			message:
				error.message || "Error deleting episode from watch history",
		});
	}
};

export const getWatchStats = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		const stats = await WatchHistory.aggregate([
			{
				$match: {
					userId: new mongoose.Types.ObjectId(userId),
				},
			},
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		const contentTypeStats = await WatchHistory.aggregate([
			{
				$match: {
					userId: new mongoose.Types.ObjectId(userId),
				},
			},
			{
				$group: {
					_id: "$contentType",
					count: { $sum: 1 },
				},
			},
		]);

		const totalWatchTime = await WatchHistory.aggregate([
			{
				$match: {
					userId: new mongoose.Types.ObjectId(userId),
					"progress.currentTime": { $exists: true },
				},
			},
			{
				$group: {
					_id: null,
					totalTime: { $sum: "$progress.currentTime" },
				},
			},
		]);

		const recentlyWatched = await WatchHistory.find({ userId })
			.populate("ftpServerId", "name serverType")
			.sort({ lastWatchedAt: -1 })
			.limit(10);

		res.status(200).json({
			message: "Watch stats retrieved successfully",
			stats: {
				byStatus: stats.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {} as Record<string, number>),
				byContentType: contentTypeStats.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {} as Record<string, number>),
				totalWatchTime: totalWatchTime[0]?.totalTime || 0,
			},
			recentlyWatched,
		});
	} catch (error: any) {
		res.status(500).json({
			message: error.message || "Error retrieving watch stats",
		});
	}
};
