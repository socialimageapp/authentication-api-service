/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Request, Response, Router } from "express";
import { validateBody, validateQuery } from "./middlewares/validationMiddleware.js";
import type { ZodSchema, infer as zInfer } from "zod";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";
export type AuthType = "public" | "jwt";

export interface AuthenticationResult {
	userId?: string;
	serviceId?: string;
	organizationId?: string;
}

export interface MethodSpec<
	TBody extends ZodSchema<any> | undefined,
	TQuery extends ZodSchema<any> | undefined,
	TResult extends ZodSchema<any>,
> {
	auth?: AuthType;
	schema: {
		body?: TBody;
		query?: TQuery;
		result: TResult;
	};
	permission?: string;
	handler: (args: {
		authentication: AuthenticationResult;
		query: TQuery extends ZodSchema<infer Q> ? Q : undefined;
		body: TBody extends ZodSchema<infer B> ? B : undefined;
	}) => Promise<zInfer<TResult>>;
}

export interface RouteSpec<
	TPath extends string,
	TMethods extends { [method in HttpMethod]?: MethodSpec<any, any, any> },
> {
	path: TPath;
	methods: TMethods;
}

/**
 * Helper function to create a MethodSpec with proper type inference.
 */
export function createMethodSpec<
	TBody extends ZodSchema<any> | undefined,
	TQuery extends ZodSchema<any> | undefined,
	TResult extends ZodSchema<any>,
>(spec: {
	auth?: AuthType;
	schema: {
		body?: TBody;
		query?: TQuery;
		result: TResult;
	};
	permission?: string;
	handler: (args: {
		authentication: AuthenticationResult;
		query: TQuery extends ZodSchema<infer Q> ? Q : undefined;
		body: TBody extends ZodSchema<infer B> ? B : undefined;
	}) => Promise<zInfer<TResult>>;
}): MethodSpec<TBody, TQuery, TResult> {
	return spec;
}

/**
 * Helper function to create a RouteSpec with proper type inference.
 */
export function createRouteSpec<
	TPath extends string,
	TMethods extends { [method in HttpMethod]?: MethodSpec<any, any, any> },
>(spec: RouteSpec<TPath, TMethods>): RouteSpec<TPath, TMethods> {
	return spec;
}

export function buildRouteSpecs<T extends RouteSpec<any, any>[]>(
	router: Router,
	routeSpecs: T,
) {
	routeSpecs.forEach((routeSpec) => {
		const { path, methods } = routeSpec;

		(Object.entries(methods) as [HttpMethod, MethodSpec<any, any, any>][]).forEach(
			([method, spec]) => {
				const methodLower = method.toLowerCase() as HttpMethod;
				const methodSpec = spec as MethodSpec<any, any, any>;

				router[methodLower](
					path,
					[], // Add any necessary middlewares here, such as authentication
					async (req: Request, res: Response) => {
						try {
							// Validate and parse the request body
							const body = methodSpec.schema.body
								? validateBody(methodSpec.schema.body, req)
								: undefined;

							// Validate and parse the query parameters
							const parsedQuery = methodSpec.schema.query
								? validateQuery(methodSpec.schema.query, req)
								: undefined;

							// Invoke the handler with correctly typed arguments
							const result = await methodSpec.handler({
								authentication: {}, // Implement actual authentication logic
								query: parsedQuery,
								body: body,
							});

							// Validate the response using the result schema
							const parsedResult = methodSpec.schema.result.parse(result);

							return res.json(parsedResult);
						} catch (error: any) {
							return res.status(400).json({ error: error.message });
						}
					},
				);
			},
		);
	});
}
