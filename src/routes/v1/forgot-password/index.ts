/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import AppError from "src/utils/errors/AppError";

/**
 * Schema for the response.
 */
const ForgotPasswordResponseSchema = z.object({
	message: z.string(), // Adjust the response structure as needed
});

/**
 * Fastify plugin to handle forgot-password route.
 */
const forgotPasswordRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			tags: ["Authentication"],
			response: { 200: ForgotPasswordResponseSchema },
		},
		handler: async (request, reply) => {
			// Logic to handle the forgot-password request (you can add the actual logic later)
			const message = "Returns user details of the authenticated user";

			if (!message) {
				throw new AppError("Error processing forgot password request.", 500);
			}

			// Send the response
			return reply.send({ message });
		},
	});
};

export default forgotPasswordRoutes;
