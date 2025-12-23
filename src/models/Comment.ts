import mongoose, { Schema, Document } from "mongoose";
import { ServerType, ContentType } from "./FtpServer.js";

export interface IComment extends Document {
	userId: mongoose.Types.ObjectId;
	ftpServerId: mongoose.Types.ObjectId;
	serverType: ServerType;
	contentType: ContentType;
	contentId: string;
	contentTitle: string;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
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
		comment: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

commentSchema.index({ userId: 1, ftpServerId: 1, contentId: 1 });
commentSchema.index({ ftpServerId: 1, contentId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
