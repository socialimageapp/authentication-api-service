/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const OAuth2KeysResponseSchema = z.object({
	message: z.string(),
});

const oauth2KeysRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "OAuth2 Keys",
			description: "Returns Global OAuth2 keys",
			tags: ["OAuth2"],
			response: { 200: OAuth2KeysResponseSchema },
		},
		handler: async (request, reply) => {
			return reply.send({
				message: "Token exchange",
			});
		},
	});
};

export default oauth2KeysRoutes;
