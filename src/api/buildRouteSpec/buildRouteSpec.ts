/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Request, Response, Router } from "express";
import { validateBody, validateQuery } from "./middlewares/validationMiddleware.js";
import type {
	OrganizationId,
	OrganizationServiceId,
	PermissionName,
	UserId,
} from "@adventurai/shared-types";
import type { ZodSchema, infer as ZodInfer } from "zod";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";
export type AuthType = "public" | "jwt";

export interface AuthenticationResult {
	userId?: UserId;
	serviceId?: OrganizationServiceId;
	organizationId?: OrganizationId;
}


export interface MethodSpec<TBody = any, TQuery = any, TResult = any> {
	auth?: AuthType;
	schema: {
		body?: ZodSchema<TBody>;
		query?: ZodSchema<TQuery>;
		result: ZodSchema<TResult>;
	};
	permission?: PermissionName | undefined;
	handler: (7
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
						parsedQuery as ZodInfer<typeof methodSpec.schema.query>,
						body as ZodInfer<typeof methodSpec.schema.query>,
					);
					return res.json(result);
				},
			);
		});
	});
}
