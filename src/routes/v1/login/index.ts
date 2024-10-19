/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import {
	LoginPostPayloadSchema,
	LoginSuccessResultSchema,
} from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

/**
 * Fastify plugin to handle login route.
 */
const loginRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Login to the application",
			description: "Login to the application using the provided credentials",
			tags: ["Authentication"],
			body: LoginPostPayloadSchema,
			response: { 200: LoginSuccessResultSchema },
		},
		handler: async (request, reply) => {
			return reply.send({ token: "Hello, world!", message: "Login successful" });
		},
	});
};

export default loginRoutes;
