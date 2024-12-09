/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import {
	LoginPostPayloadSchema,
	LoginSuccessResultSchema,
	withResult,
} from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authDatabase } from "src/configs/db.js";
import AppError from "src/utils/errors/AppError.js";
import bcrypt from "bcrypt";

const loginRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Login to the application",
			description: "Login to the application using the provided credentials",
			tags: ["Authentication"],
			body: LoginPostPayloadSchema,
			response: { 200: withResult(LoginSuccessResultSchema) },
		},
		handler: async (request, reply) => {
			const { email, password } = request.body;

			const user = await authDatabase.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
			});

			// Dummy hash to prevent timing attacks
			const dummyHash = "$2b$10$" + "X".repeat(53);
			const passwordMatch = !user
				? await bcrypt.compare(password, dummyHash)
				: await bcrypt.compare(password, user.password);

			if (!user || !passwordMatch) {
				throw new AppError(
					"Invalid email or password",
					401,
					"InvalidCredentials",
				);
			}
			const token = fastify.jwt.sign(
				{ sub: user.id, email: user.email, role: user.userType },
				{ expiresIn: "1h" },
			);

			return reply.send({ result: { token, message: "Login successful" } });
		},
	});
};

export default loginRoutes;
