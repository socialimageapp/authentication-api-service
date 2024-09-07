/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Router, Request, Response, NextFunction } from "express";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

class AppError extends Error {
	public status: string;
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

const baseRouter: Router = express.Router();

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Too many requests from this IP, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
});

baseRouter.use(apiLimiter);
baseRouter.use(helmet());

baseRouter.use((req: Request, res: Response, next: NextFunction) => {
	// eslint-disable-next-line no-console
	console.log(`${req.method} ${req.path}`);
	next();
});

// Universal error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
baseRouter.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
	// eslint-disable-next-line no-console
	console.error(`Error: ${err.message}`);
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		error: {
			status: err.status || "error",
			message: err.message || "Something went wrong!",
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Stack trace only in development
		},
	});
});

export default baseRouter;
export { AppError };
