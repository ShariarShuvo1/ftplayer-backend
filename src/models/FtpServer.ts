import mongoose, { Schema, Document } from "mongoose";

export enum ServerType {
	CIRCLE_FTP = "circleftp",
	DFLIX = "dflix",
}

export enum ServerCapability {
	BROWSE_HOME = "browse_home",
	BROWSE_CATEGORIES = "browse_categories",
	SEARCH = "search",
	WATCH = "watch",
	DOWNLOAD = "download",
	FILTER_BY_CATEGORY = "filter_by_category",
	FILTER_BY_YEAR = "filter_by_year",
	FILTER_BY_GENRE = "filter_by_genre",
	FILTER_BY_QUALITY = "filter_by_quality",
	PAGINATION = "pagination",
	TRENDING = "trending",
	TV_SERIES = "tv_series",
	MULTI_FILE_CONTENT = "multi_file_content",
	SINGLE_FILE_CONTENT = "single_file_content",
	SEASONED_EPISODES = "seasoned_episodes",
	VIEW_COUNTS = "view_counts",
}

export enum ContentType {
	SINGLE_VIDEO = "singleVideo",
	SERIES = "series",
	SINGLE_FILE = "singleFile",
	MULTI_FILE = "multiFile",
	MOVIE = "movie",
	TV_SHOW = "tvShow",
}

export interface EndpointConfig {
	homePage?: string;
	categories?: string;
	browse?: string;
	search?: string;
	details?: string;
	sorting?: string;
	trending?: string;
	tvShows?: string;
	movies?: string;
	menu?: string;
	genres?: string;
	years?: string;
}

export interface ImageConfig {
	baseUrl: string;
	posterPath?: string;
	thumbnailPath?: string;
	backdropPath?: string;
	dynamicPaths?: boolean;
}

export interface ServerTypeConfig {
	baseUrl: string;
	imageConfig: ImageConfig;
	requiresAuth: boolean;
	capabilities: ServerCapability[];
	contentTypes: ContentType[];
	endpoints: EndpointConfig;
	paginationStyle?: "standard" | "offset" | "cursor" | "none";
	responseFormat?: "json" | "xml";
	customFields?: Record<string, any>;
}

export interface IFtpServer extends Document {
	userId: mongoose.Types.ObjectId;
	name: string;
	description?: string;
	serverType: ServerType;
	isActive: boolean;
	config: ServerTypeConfig;
	ispProvider: string;
	pingUrl?: string;
	uiUrl?: string;
	priority: number;
	createdAt: Date;
	updatedAt: Date;
}

const ftpServerSchema = new Schema<IFtpServer>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		serverType: {
			type: String,
			enum: Object.values(ServerType),
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		config: {
			type: Schema.Types.Mixed,
			required: true,
		},
		ispProvider: {
			type: String,
			required: true,
			trim: true,
		},
		pingUrl: {
			type: String,
		},
		uiUrl: {
			type: String,
		},
		priority: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: true,
	}
);

ftpServerSchema.index({ userId: 1, serverType: 1 });
ftpServerSchema.index({ userId: 1, isActive: 1, priority: -1 });
ftpServerSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

const FtpServer = mongoose.model<IFtpServer>("FtpServer", ftpServerSchema);

export default FtpServer;
