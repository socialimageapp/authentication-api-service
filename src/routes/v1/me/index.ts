/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { withResult } from "@adventurai/shared-types";
import { z } from "zod";

const MeResponseSchema = z.object({ message: z.string() });

const meRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User Details",
			description: "Returns user details of the authenticated user",
			tags: ["Users"],
			response: { 200: withResult(MeResponseSchema) },
		},
		handler: async (request, reply) => {
			return reply.send({
				result: { message: "Returns user details of the authenticated user" },
			});
		},
	});
};

export default meRoutes;
