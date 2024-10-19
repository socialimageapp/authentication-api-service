/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

/**
 * Schema for the response.
 */
const UsersResponseSchema = z.object({
	result: z.array(z.unknown()), // Adjust based on the actual structure of the result
});

/**
 * Fastify plugin to handle the "/users" route.
 */
const usersRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			hide: true,
			summary: "Get Users",
			description: "Returns a list of users",
			tags: ["Users"],
			response: { 200: UsersResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic to retrieve users (currently returns an empty array)
			return reply.send({ result: [] });
		},
	});
};

export default usersRoutes;
