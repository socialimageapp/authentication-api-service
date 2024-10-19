/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { UserId } from "@adventurai/shared-types";

/**
 * Schema for the route parameters.
 */
const UserRolesParamsSchema = z.object({
	userId: z.string().uuid(), // Assuming UserId is a UUID, adjust if necessary
});

/**
 * Schema for the response.
 */
const UserRolesResponseSchema = z.object({
	message: z.string(), // Adjust based on your actual response structure
});

/**
 * Fastify plugin to handle the "/users/:userId/roles" route.
 */
const userRolesRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get Organization Roles",
			description: "Returns custom organization roles",
			tags: ["Organization Roles"],
			params: UserRolesParamsSchema,
			response: { 200: UserRolesResponseSchema },
		},
		handler: async (request, reply) => {
			const { userId } = request.params as { userId: UserId };

			// Logic to retrieve roles of the user based on userId
			return reply.send({
				message: `Roles of user with ID: ${userId}`,
			});
		},
	});
};

export default userRolesRoutes;
