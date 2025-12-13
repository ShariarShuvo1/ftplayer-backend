import { Router, type Router as ExpressRouter } from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router: ExpressRouter = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.get("/health", (req, res) => {
	res.status(200).json({ message: "Server is running" });
});

export default router;
