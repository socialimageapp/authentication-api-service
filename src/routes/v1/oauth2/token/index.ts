/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const OAuth2TokenResponseSchema = z.object({
	message: z.string(),
});

const oauth2TokenRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "OAuth2 Token Exchange",
			description: "Exchanges your access token for a scoped one",
			tags: ["OAuth2"],
			response: { 200: OAuth2TokenResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic for token exchange
			return reply.send({
				message: "Token exchange",
			});
		},
	});
};

export default oauth2TokenRoutes;
