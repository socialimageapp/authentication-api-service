/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { OrganizationSchema, withResult } from "@adventurai/shared-types";
import { z } from "zod";

const organizationsRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Organizations",
			description: "Returns a list of organizations for the authenticated user",
			tags: ["Organizations"],
			response: { 200: withResult(z.array(OrganizationSchema)) },
		},
		handler: async (request, reply) => {
			// Logic to retrieve organizations (currently just an empty array)
			return reply.send({ result: [] });
		},
	});
};

export default organizationsRoutes;
