/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

export function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header missing" });
	}

	const [scheme, token] = authHeader.split(" ");
	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({ error: "Invalid authorization format" });
	}

	try {
		const decoded = jwt.verify(token, jwtSecret);
		(req as any).user = decoded; // Attach user info to the request
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}
