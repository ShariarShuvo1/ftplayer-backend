import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import FtpServer, { ServerType } from "../models/FtpServer.js";
import { getServerTypeConfig } from "../services/serverTypeRegistry.js";
import bcrypt from "bcryptjs";

const seedDatabase = async (): Promise<void> => {
	try {
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) {
			throw new Error("MONGODB_URI is not defined");
		}

		await mongoose.connect(mongoUri);
		console.log("✓ Connected to MongoDB");

		await FtpServer.deleteMany({});
		console.log("✓ Cleared existing FTP servers");

		let user = await User.findOne({ email: "demo@ftplayer.com" });

		if (!user) {
			console.log("✓ Creating demo user...");
			const hashedPassword = await bcrypt.hash("demo1234", 10);
			user = await User.create({
				name: "Demo User",
				email: "demo@ftplayer.com",
				password: hashedPassword,
			});
			console.log("✓ Demo user created");
		} else {
			console.log("✓ Using existing demo user");
		}

		const circleFtpConfig = getServerTypeConfig(ServerType.CIRCLE_FTP);
		const circleFtpServer = await FtpServer.create({
			userId: user._id,
			name: "CircleFTP Server",
			description:
				"Primary CircleFTP server with movies, series, games, and multi-file content",
			serverType: ServerType.CIRCLE_FTP,
			config: circleFtpConfig,
			ispProvider: "Circle Internet",
			pingUrl: "http://new.circleftp.net/",
			uiUrl: "http://new.circleftp.net:5000",
			priority: 10,
			isActive: true,
		});
		console.log(`✓ Created CircleFTP server (ID: ${circleFtpServer._id})`);

		const dflixConfig = getServerTypeConfig(ServerType.DFLIX);
		const dflixServer = await FtpServer.create({
			userId: user._id,
			name: "Dflix Server",
			description:
				"Dflix streaming server with Hollywood, Bollywood, and international content",
			serverType: ServerType.DFLIX,
			config: dflixConfig,
			ispProvider: "Dot Internet",
			pingUrl: "http://www.dflix.live",
			uiUrl: "http://www.dflix.live",
			priority: 5,
			isActive: true,
		});
		console.log(`✓ Created Dflix server (ID: ${dflixServer._id})`);

		const amaderFtpConfig = getServerTypeConfig(ServerType.AMADER_FTP);
		const amaderFtpServer = await FtpServer.create({
			userId: user._id,
			name: "AmaderFTP Server",
			description:
				"AmaderFTP Jellyfin-based server with Movies and TV Series",
			serverType: ServerType.AMADER_FTP,
			config: amaderFtpConfig,
			ispProvider: "Amader.Net",
			pingUrl: "http://amaderftp.net:8096/",
			uiUrl: "http://amaderftp.net/",
			priority: 8,
			isActive: true,
		});
		console.log(`✓ Created AmaderFTP server (ID: ${amaderFtpServer._id})`);

		console.log("\n=== Seed Summary ===");
		console.log(`User: ${user.name} (${user.email})`);
		console.log(`Password: demo1234`);
		console.log(`Servers created: 3`);
		console.log(`- CircleFTP (Priority: 10)`);
		console.log(`- Dflix (Priority: 5)`);
		console.log(`- AmaderFTP (Priority: 8)`);
		console.log("\n✓ Database seeding completed successfully!");

		await mongoose.disconnect();
		console.log("✓ Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("✗ Error seeding database:", error);
		await mongoose.disconnect();
		process.exit(1);
	}
};

seedDatabase();
