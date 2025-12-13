import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const startTime = Date.now();

	res.on("finish", () => {
		const responseTime = Date.now() - startTime;
		const statusCode = res.statusCode;
		const method = req.method;
		const url = req.originalUrl;
		const ip = req.ip || "unknown";

		logger.info("API Request", {
			meta: {
				method,
				url,
				statusCode,
				responseTime,
				ip,
			},
		});
	});

	next();
};
