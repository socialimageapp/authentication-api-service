/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

/**
 * Schema for the response.
 */
const MeResponseSchema = z.object({
	message: z.string(), // Adjust based on your actual response structure
});

/**
 * Fastify plugin to handle the "/me" route.
 */
const meRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User Details",
			description: "Returns user details of the authenticated user",
			tags: ["Users"],
			response: { 200: MeResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic to return the authenticated user's details
			return reply.send({
				message: "Returns user details of the authenticated user",
			});
		},
	});
};

export default meRoutes;
