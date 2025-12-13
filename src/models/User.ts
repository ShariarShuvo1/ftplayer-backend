import mongoose, { Document, Schema, HydratedDocument } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Please provide a name"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
		},
		email: {
			type: String,
			required: [true, "Please provide an email"],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email",
			],
		},
		password: {
			type: String,
			required: [true, "Please provide a password"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
	},
	{ timestamps: true }
);

userSchema.pre<HydratedDocument<IUser>>("save", async function () {
	if (!this.isModified("password")) {
		return;
	}

	try {
		const salt = await bcryptjs.genSalt(10);
		this.password = await bcryptjs.hash(this.password, salt);
	} catch (error) {
		throw error;
	}
});

userSchema.methods.matchPassword = async function (
	enteredPassword: string
): Promise<boolean> {
	return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
