/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import AppError from "src/utils/errors/AppError";
import { ForgotPasswordResultSchema } from "@adventurai/shared-types";

const forgotPasswordRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			tags: ["Authentication"],
			response: { 200: ForgotPasswordResultSchema },
		},
		handler: async (request, reply) => {
			const message = "Returns user details of the authenticated user";

			if (!message) {
				throw new AppError("Error processing forgot password request.", 500);
			}

			return reply.send({ message });
		},
	});
};

export default forgotPasswordRoutes;
