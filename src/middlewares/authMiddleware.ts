import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
	id: string;
	iat?: number;
	exp?: number;
}

declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(401).json({ message: "No token provided" });
			return;
		}

		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			res.status(500).json({ message: "JWT_SECRET is not configured" });
			return;
		}

		const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
		req.userId = decoded.id;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};
