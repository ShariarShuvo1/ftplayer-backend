import mongoose, { Schema, Document } from "mongoose";

export interface IFtpServer extends Document {
	userId: mongoose.Types.ObjectId;
	name: string;
	description?: string;
	pingUrl: string;
	uiUrl: string;
	childServers: string[];
	ispProvider: string;
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
		},
		description: {
			type: String,
			default: undefined,
		},
		pingUrl: {
			type: String,
			required: true,
		},
		uiUrl: {
			type: String,
			required: true,
		},
		childServers: {
			type: [String],
			default: [],
		},
		ispProvider: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const FtpServer = mongoose.model<IFtpServer>("FtpServer", ftpServerSchema);

export default FtpServer;
