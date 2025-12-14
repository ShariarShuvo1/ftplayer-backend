import express, { type Express } from "express";
import "dotenv/config";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import ftpServerRoutes from "./routes/ftpServerRoutes.js";
import { requestLogger } from "./middlewares/loggerMiddleware.js";
import logger from "./config/logger.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/ftp-servers", ftpServerRoutes);

if (process.env.NODE_ENV !== "production") {
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`);
	});
}

export default app;
