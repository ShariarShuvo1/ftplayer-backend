import {
	ServerType,
	ServerCapability,
	ServerTypeConfig,
	ContentType,
} from "../models/FtpServer.js";

export const SERVER_TYPE_REGISTRY: Record<ServerType, ServerTypeConfig> = {
	[ServerType.CIRCLE_FTP]: {
		baseUrl: "http://new.circleftp.net:5000",
		imageConfig: {
			baseUrl: "http://new.circleftp.net:5000/uploads/",
			dynamicPaths: false,
		},
		requiresAuth: false,
		capabilities: [
			ServerCapability.BROWSE_HOME,
			ServerCapability.BROWSE_CATEGORIES,
			ServerCapability.SEARCH,
			ServerCapability.WATCH,
			ServerCapability.DOWNLOAD,
			ServerCapability.PAGINATION,
			ServerCapability.TRENDING,
			ServerCapability.TV_SERIES,
			ServerCapability.MULTI_FILE_CONTENT,
			ServerCapability.SINGLE_FILE_CONTENT,
			ServerCapability.SEASONED_EPISODES,
			ServerCapability.VIEW_COUNTS,
			ServerCapability.FILTER_BY_CATEGORY,
		],
		contentTypes: [
			ContentType.SINGLE_VIDEO,
			ContentType.SERIES,
			ContentType.SINGLE_FILE,
			ContentType.MULTI_FILE,
		],
		endpoints: {
			homePage: "/api/home-page/getHomePagePosts",
			categories: "/api/categories",
			browse: "/api/posts",
			search: "/api/posts",
			details: "/api/posts/:id",
		},
		paginationStyle: "standard",
		responseFormat: "json",
		customFields: {
			hasCategoryPosts: true,
			hasMostVisitedPosts: true,
			hasLatestPost: true,
			searchQueryParam: "searchTerm",
			categoryQueryParam: "categoryExact",
			limitQueryParam: "limit",
			pageQueryParam: "page",
			orderQueryParam: "order",
			defaultLimit: 50,
			contentStructure: {
				singleVideo: "string",
				singleFile: "string",
				series: "array_of_seasons",
				multiFile: "array_of_files",
			},
			imageFields: {
				poster: "image",
				thumbnail: "imageSm",
				cover: "cover",
			},
			metadataFields: [
				"title",
				"name",
				"type",
				"metaData",
				"tags",
				"quality",
				"watchTime",
				"year",
				"view",
				"categories",
			],
		},
	},

	[ServerType.DFLIX]: {
		baseUrl: "http://www.dflix.live/api/v1",
		imageConfig: {
			baseUrl: "http://www.dflix.live/Admin/main/images",
			posterPath: "/poster/",
			backdropPath: "/{id}/screen/",
			dynamicPaths: true,
		},
		requiresAuth: false,
		capabilities: [
			ServerCapability.BROWSE_CATEGORIES,
			ServerCapability.SEARCH,
			ServerCapability.WATCH,
			ServerCapability.DOWNLOAD,
			ServerCapability.FILTER_BY_CATEGORY,
			ServerCapability.FILTER_BY_YEAR,
			ServerCapability.FILTER_BY_GENRE,
			ServerCapability.FILTER_BY_QUALITY,
			ServerCapability.PAGINATION,
			ServerCapability.TV_SERIES,
		],
		contentTypes: [ContentType.MOVIE, ContentType.TV_SHOW],
		endpoints: {
			search: "/search.php",
			movies: "/movies.php",
			browse: "/movies.php",
			sorting: "/sorting.php",
			tvShows: "/tvshows.php",
			menu: "/menu.php",
			categories: "/menu.php",
			genres: "/moviegenre.php",
			years: "/movieyearbycat.php",
		},
		paginationStyle: "standard",
		responseFormat: "json",
		customFields: {
			directWatchLinks: true,
			searchQueryParam: "search",
			categoryQueryParam: "category",
			limitQueryParam: "limit",
			pageQueryParam: "page",
			sortByParam: "sort_by",
			defaultLimit: 30,
			defaultSortBy: "uploadTime DESC",
			validCategories: [
				"Hollywood",
				"English Movies",
				"Korean",
				"Chinese",
				"Japanese",
				"Iranian",
				"Norwegian",
				"Swedish",
				"Indonesian",
				"Vietnamese",
				"Polish",
				"Bollywood",
				"Hindi Dubbed",
				"Tamil",
				"Telugu",
				"Malayalam",
				"Kannada",
				"English Tv Series",
			],
			imageConstruction: {
				poster: {
					field: "poster",
					path: "/poster/",
				},
				tvPoster: {
					field: "TVposter",
					path: "/poster/",
				},
				backdrop: {
					field: "backdrops_Poster",
					pathTemplate: "/{id}/screen/",
					requiresContentId: true,
				},
			},
			metadataFields: {
				movies: [
					"id",
					"MovieTitle",
					"MovieYear",
					"MovieWatchLink",
					"poster",
					"MovieCategory",
					"MovieQuality",
					"Story",
					"Actors",
					"Runtime",
					"backdrops_Poster",
				],
				tvShows: [
					"id",
					"TVtitle",
					"TVID",
					"TVposter",
					"FileLocation",
					"TVCategory",
				],
			},
			tvShowsLogic: {
				usesFileLocation: true,
				requiresEpisodeEndpoint: true,
			},
			noDetailEndpoint: true,
			passFullObjectToDetails: true,
		},
	},

	[ServerType.AMADER_FTP]: {
		baseUrl: "http://amaderftp.net:8096",
		imageConfig: {
			baseUrl: "http://amaderftp.net:8096",
			posterPath: "/Items/{itemId}/Images/Primary",
			backdropPath: "/Items/{itemId}/Images/Backdrop",
			dynamicPaths: true,
		},
		requiresAuth: true,
		capabilities: [
			ServerCapability.BROWSE_HOME,
			ServerCapability.BROWSE_CATEGORIES,
			ServerCapability.SEARCH,
			ServerCapability.WATCH,
			ServerCapability.DOWNLOAD,
			ServerCapability.PAGINATION,
			ServerCapability.TV_SERIES,
			ServerCapability.SEASONED_EPISODES,
			ServerCapability.FILTER_BY_CATEGORY,
		],
		contentTypes: [ContentType.MOVIE, ContentType.SERIES],
		endpoints: {
			authenticate: "/Users/authenticatebyname",
			userItems: "/Users/{userId}/Items",
			itemDetails: "/Users/{userId}/Items/{itemId}",
			seriesEpisodes: "/Shows/{seriesId}/Episodes",
			search: "/Users/{userId}/Items",
			browse: "/Users/{userId}/Items",
			images: "/Items/{itemId}/Images/{imageType}",
		},
		paginationStyle: "offset",
		responseFormat: "json",
		customFields: {
			authCredentials: {
				username: "user",
				password: "1234",
			},
			authHeader: "X-Emby-Authorization",
			authHeaderFormat:
				'MediaBrowser Client="{client}", Device="{device}", DeviceId="{deviceId}", Version="{version}"',
			authHeaderWithToken:
				'MediaBrowser Client="{client}", Device="{device}", DeviceId="{deviceId}", Version="{version}", Token="{token}"',
			defaultClient: "FTPlayer",
			defaultDevice: "Mobile",
			defaultVersion: "1.0.0",
			libraryIds: {
				movies: "4f9a1aee122b0b1d02c34ba39f31e331",
				tvShows: "ea34d9f8d8b815c9ee04e1b30418f93d",
			},
			searchQueryParam: "searchTerm",
			limitQueryParam: "Limit",
			startIndexParam: "StartIndex",
			sortByParam: "SortBy",
			sortOrderParam: "SortOrder",
			recursiveParam: "Recursive",
			includeItemTypesParam: "IncludeItemTypes",
			parentIdParam: "ParentId",
			fieldsParam: "Fields",
			defaultLimit: 20,
			defaultFields:
				"PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo",
			itemTypes: {
				movie: "Movie",
				series: "Series",
				episode: "Episode",
			},
			sortOptions: {
				dateCreated: "DateCreated",
				premiereDate: "PremiereDate",
				sortName: "SortName",
				datePlayed: "DatePlayed",
			},
			ticksPerSecond: 10000000,
			imageConstruction: {
				poster: {
					path: "/Items/{itemId}/Images/Primary",
					queryParams: ["tag", "quality", "fillWidth", "fillHeight"],
					defaultQuality: 96,
					defaultWidth: 207,
					defaultHeight: 310,
				},
				backdrop: {
					path: "/Items/{itemId}/Images/Backdrop",
					queryParams: ["tag", "quality", "fillWidth", "fillHeight"],
					defaultQuality: 96,
					defaultWidth: 360,
					defaultHeight: 203,
				},
				logo: {
					path: "/Items/{itemId}/Images/Logo",
					queryParams: ["tag", "quality"],
				},
			},
			metadataFields: [
				"Id",
				"Name",
				"Type",
				"RunTimeTicks",
				"PremiereDate",
				"OfficialRating",
				"CommunityRating",
				"Overview",
				"Genres",
				"ProductionYear",
				"ImageTags",
				"BackdropImageTags",
				"UserData",
				"MediaSources",
				"Path",
			],
			streamUrlTemplate: "/Videos/{itemId}/stream",
		},
	},
};

export function getServerTypeConfig(serverType: ServerType): ServerTypeConfig {
	const config = SERVER_TYPE_REGISTRY[serverType];
	if (!config) {
		throw new Error(`Unknown server type: ${serverType}`);
	}
	return config;
}

export function getServerCapabilities(
	serverType: ServerType
): ServerCapability[] {
	return SERVER_TYPE_REGISTRY[serverType].capabilities;
}

export function hasCapability(
	serverType: ServerType,
	capability: ServerCapability
): boolean {
	return SERVER_TYPE_REGISTRY[serverType].capabilities.includes(capability);
}

export function getEndpoint(
	serverType: ServerType,
	endpointKey: keyof ServerTypeConfig["endpoints"]
): string | undefined {
	return SERVER_TYPE_REGISTRY[serverType].endpoints[endpointKey];
}

export function buildImageUrl(
	serverType: ServerType,
	imagePath: string,
	imageType: "poster" | "thumbnail" | "backdrop" = "poster",
	contentId?: string
): string {
	const config = SERVER_TYPE_REGISTRY[serverType];
	const { imageConfig } = config;

	switch (serverType) {
		case ServerType.CIRCLE_FTP:
			return `${imageConfig.baseUrl}${imagePath}`;

		case ServerType.DFLIX:
			if (imageType === "backdrop" && contentId) {
				const backdropPath =
					imageConfig.backdropPath?.replace("{id}", contentId) || "";
				return `${imageConfig.baseUrl}${backdropPath}${imagePath}`;
			}
			const posterPath = imageConfig.posterPath || "/poster/";
			return `${imageConfig.baseUrl}${posterPath}${imagePath}`;

		case ServerType.AMADER_FTP:
			if (!contentId) return "";
			const amaderPath =
				imageType === "backdrop"
					? imageConfig.backdropPath?.replace("{itemId}", contentId)
					: imageConfig.posterPath?.replace("{itemId}", contentId);
			return `${imageConfig.baseUrl}${amaderPath}?tag=${imagePath}&quality=96`;

		default:
			return `${imageConfig.baseUrl}${imagePath}`;
	}
}

export function getContentTypes(serverType: ServerType): ContentType[] {
	return SERVER_TYPE_REGISTRY[serverType].contentTypes;
}

export function getPaginationStyle(serverType: ServerType): string | undefined {
	return SERVER_TYPE_REGISTRY[serverType].paginationStyle;
}
