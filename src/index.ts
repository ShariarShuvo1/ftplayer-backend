import express, { type Express } from "express";
import "dotenv/config";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import ftpServerRoutes from "./routes/ftpServerRoutes.js";
import workingFtpServerRoutes from "./routes/workingFtpServerRoutes.js";
import watchHistoryRoutes from "./routes/watchHistoryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { requestLogger } from "./middlewares/loggerMiddleware.js";
import logger from "./config/logger.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/ftp-servers", ftpServerRoutes);
app.use("/api/working-ftp-servers", workingFtpServerRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/comments", commentRoutes);

if (process.env.NODE_ENV !== "production") {
	const PORT: number = Number(process.env.PORT) || 5000;
	const HOST: string = process.env.HOST || "0.0.0.0";
	app.listen(PORT, HOST, () => {
		logger.info(`Server is running on ${HOST}:${PORT}`);
	});
}

export default app;
