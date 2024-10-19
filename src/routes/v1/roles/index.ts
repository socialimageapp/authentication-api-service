/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

/**
 * Schema for the response.
 */
const RolesResponseSchema = z.object({
	message: z.string(), // Adjust based on actual response structure
});

/**
 * Fastify plugin to handle the "/roles" route.
 */
const rolesRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Roles",
			description: "Returns built-in applicationroles",
			tags: ["Roles"],
			response: { 200: RolesResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic to retrieve roles for the current authenticated user
			return reply.send({
				message: "List of Roles for the current authenticated user",
			});
		},
	});
};

export default rolesRoutes;
