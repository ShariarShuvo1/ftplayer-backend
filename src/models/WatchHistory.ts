import mongoose, { Schema, Document } from "mongoose";
import { ServerType, ContentType } from "./FtpServer.js";

export enum WatchStatus {
	WATCHING = "watching",
	COMPLETED = "completed",
	ON_HOLD = "on_hold",
	DROPPED = "dropped",
}

export interface IEpisodeProgress {
	episodeNumber: number;
	episodeId?: string;
	episodeTitle?: string;
	status: WatchStatus;
	progress: {
		currentTime: number;
		duration: number;
		percentage: number;
	};
	lastWatchedAt: Date;
}

export interface ISeasonProgress {
	seasonNumber: number;
	seasonId?: string;
	episodes: IEpisodeProgress[];
}

export interface IProgressInfo {
	currentTime: number;
	duration: number;
	percentage: number;
}

export interface IWatchHistory extends Document {
	userId: mongoose.Types.ObjectId;
	ftpServerId: mongoose.Types.ObjectId;
	serverType: ServerType;
	contentType: ContentType;
	contentId: string;
	contentTitle: string;
	status: WatchStatus;
	progress?: IProgressInfo;
	seriesProgress?: ISeasonProgress[];
	metadata?: Record<string, any>;
	lastWatchedAt: Date;
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const episodeProgressSchema = new Schema<IEpisodeProgress>(
	{
		episodeNumber: {
			type: Number,
			required: true,
		},
		episodeId: {
			type: String,
		},
		episodeTitle: {
			type: String,
		},
		status: {
			type: String,
			enum: Object.values(WatchStatus),
			default: WatchStatus.WATCHING,
		},
		progress: {
			currentTime: {
				type: Number,
				default: 0,
			},
			duration: {
				type: Number,
				default: 0,
			},
			percentage: {
				type: Number,
				default: 0,
				min: 0,
				max: 100,
			},
		},
		lastWatchedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false }
);

const seasonProgressSchema = new Schema<ISeasonProgress>(
	{
		seasonNumber: {
			type: Number,
			required: true,
		},
		seasonId: {
			type: String,
		},
		episodes: [episodeProgressSchema],
	},
	{ _id: false }
);

const watchHistorySchema = new Schema<IWatchHistory>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		ftpServerId: {
			type: Schema.Types.ObjectId,
			ref: "FtpServer",
			required: true,
		},
		serverType: {
			type: String,
			enum: Object.values(ServerType),
			required: true,
		},
		contentType: {
			type: String,
			enum: Object.values(ContentType),
			required: true,
		},
		contentId: {
			type: String,
			required: true,
		},
		contentTitle: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(WatchStatus),
			default: WatchStatus.WATCHING,
		},
		progress: {
			currentTime: {
				type: Number,
				default: 0,
			},
			duration: {
				type: Number,
				default: 0,
			},
			percentage: {
				type: Number,
				default: 0,
				min: 0,
				max: 100,
			},
		},
		seriesProgress: [seasonProgressSchema],
		metadata: {
			type: Schema.Types.Mixed,
		},
		lastWatchedAt: {
			type: Date,
			default: Date.now,
		},
		completedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

watchHistorySchema.index({ userId: 1, ftpServerId: 1, contentId: 1 });
watchHistorySchema.index({ userId: 1, status: 1 });
watchHistorySchema.index({ userId: 1, lastWatchedAt: -1 });
watchHistorySchema.index({
	userId: 1,
	serverType: 1,
	contentType: 1,
	status: 1,
});

const WatchHistory = mongoose.model<IWatchHistory>(
	"WatchHistory",
	watchHistorySchema
);

export default WatchHistory;
