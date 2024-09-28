/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { ZodSchema } from "zod";
import type { Request } from "express";

export function validateBody<T>(
	schema: ZodSchema<T> | undefined,
	req: Request,
): T | undefined {
	if (!schema) {
		return undefined;
	}
	const parsedResult = schema.safeParse(req.body);
	if (parsedResult.success) {
		return parsedResult.data;
	}
	throw new Error("Invalid body");
}

export function validateQuery<T>(schema: ZodSchema<T>, req: Request): T | undefined {
	const parsedResult = schema.safeParse(req.query);
	if (parsedResult.success) {
		return parsedResult.data;
	}
	throw new Error("Invalid query");
}
