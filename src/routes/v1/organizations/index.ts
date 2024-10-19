/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

/**
 * Schema for the response.
 */
const OrganizationsResponseSchema = z.object({
	result: z.array(z.unknown()), // Adjust based on the actual structure of the result
});

/**
 * Fastify plugin to handle the "/organizations" route.
 */
const organizationsRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Organizations",
			description: "Returns a list of organizations for the authenticated user",
			tags: ["Organizations"],
			response: { 200: OrganizationsResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic to retrieve organizations (currently just an empty array)
			return reply.send({ result: [] });
		},
	});
};

export default organizationsRoutes;
