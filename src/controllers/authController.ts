import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

interface SignupRequest {
	name?: string;
	email?: string;
	password?: string;
}

interface LoginRequest {
	email?: string;
	password?: string;
}

interface UserRequest extends Request {
	userId?: string;
}

const generateToken = (userId: string): string => {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		throw new Error("JWT_SECRET is not configured");
	}

	return jwt.sign({ id: userId }, jwtSecret, {
		expiresIn: "7d",
	});
};

export const signup = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password } = req.body as SignupRequest;

		if (!name || !email || !password) {
			res.status(400).json({
				message: "Please provide name, email, and password",
			});
			return;
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({ message: "Email already exists" });
			return;
		}

		const user = await User.create({
			name,
			email,
			password,
		});

		const token = generateToken(user._id.toString());

		res.status(201).json({
			message: "User created successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: error instanceof Error ? error.message : "Signup failed",
		});
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body as LoginRequest;

		if (!email || !password) {
			res.status(400).json({
				message: "Please provide email and password",
			});
			return;
		}

		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}

		const isPasswordMatched = await user.matchPassword(password);
		if (!isPasswordMatched) {
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}

		const token = generateToken(user._id.toString());

		res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: error instanceof Error ? error.message : "Login failed",
		});
	}
};

export const getMe = async (req: UserRequest, res: Response): Promise<void> => {
	try {
		if (!req.userId) {
			res.status(401).json({ message: "User not authenticated" });
			return;
		}

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		res.status(500).json({
			message:
				error instanceof Error ? error.message : "Failed to fetch user",
		});
	}
};
