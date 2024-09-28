/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Request, Router } from "express";
import { validateBody, validateQuery } from "./middlewares/validationMiddleware.js";
import type { Organization, PermissionName, User } from "@adventurai/shared-types";
import type { ZodSchema } from "zod";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";
export type AuthType = "public" | "jwt";

export interface AuthenticationResult {
	user?: User;
	service?: OrganizationService;
	organization?: Organization;
}

export interface MethodSpec<TBody = any, TQuery = any, TResult = any> {
	auth?: AuthType;
	schema: {
		body?: ZodSchema<TBody>;
		query?: ZodSchema<TQuery>;
		result: ZodSchema<TResult>;
	};
	permission?: PermissionName | undefined;
	handler: (
		authentication: AuthenticationResult,
		query: TQuery,
		body: TBody,
	) => Promise<TResult>;
}

export interface RouteSpec {
	path: string;
	methods: {
		[method in HttpMethod]?: MethodSpec<any, any, any>;
	};
}

export function buildRouteSpecs(router: Router, routeSpecs: RouteSpec[]) {
	routeSpecs.forEach((routeSpec) => {
		const { path, methods } = routeSpec;

		Object.entries(methods).forEach(([method, spec]) => {
			const methodLower = method.toLowerCase() as HttpMethod;

			// Type assertion for MethodSpec
			const methodSpec = spec as MethodSpec;

			// Add the route to the router
			(router as any)[methodLower](
				path,
				[],
				async (req: Request, res: Response) => {
					const body = validateBody(methodSpec.schema.body, req);
					const parsedQuery = methodSpec.schema.query
						? validateQuery(methodSpec.schema.query, req)
						: undefined;

					const result = await methodSpec.handler(
						authenticationResult,
						parsedQuery,
						body,
					);
					return res.json(result);
				},
			);
		});
	});
}
