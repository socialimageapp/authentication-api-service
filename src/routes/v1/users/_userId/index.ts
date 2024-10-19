/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { UserId } from "@adventurai/shared-types";

/**
 * Schema for the route parameters.
 */
const UserParamsSchema = z.object({
	userId: z.string().uuid(), // Assuming UserId is a UUID, adjust if necessary
});

/**
 * Schema for the response.
 */
const UserResponseSchema = z.object({
	message: z.string(), // Adjust based on actual response structure
});

/**
 * Fastify plugin to handle the "/users/:userId" route.
 */
const userRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User",
			description: "Returns details of the user with the provided userId",
			tags: ["Users"],
			params: UserParamsSchema,
			response: { 200: UserResponseSchema },
		},
		handler: async (request, reply) => {
			const { userId } = request.params as { userId: UserId };

			// Logic to retrieve details for the user with the provided userId
			return reply.send({
				message: `Details of user with ID: ${userId}`,
			});
		},
	});
};

export default userRoutes;
