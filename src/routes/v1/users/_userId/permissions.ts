/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { UserId } from "@adventurai/shared-types";

/**
 * Schema for the request parameters.
 */
const PermissionsParamsSchema = z.object({
	userId: z.string().uuid(), // Assuming UserId is a UUID, adjust if necessary
});

/**
 * Schema for the response.
 */
const PermissionsResponseSchema = z.object({
	message: z.string(), // Adjust based on actual response structure
});

/**
 * Fastify plugin to handle the "/permissions" route.
 */
const permissionsRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/permissions", {
		schema: {
			params: PermissionsParamsSchema,
			response: { 200: PermissionsResponseSchema },
		},
		handler: async (request, reply) => {
			const { userId } = request.params as { userId: UserId };

			// Logic to retrieve permissions for the user with the provided userId
			return reply.send({
				message: `Permissions of user with ID: ${userId}`,
			});
		},
	});
};

export default permissionsRoutes;
