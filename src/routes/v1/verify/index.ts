/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authDatabase, ResetPasswordResultSchema } from "@adventurai/shared-types";
import AppError from "src/utils/errors/AppError";

/**
 * Schema for verifying the token in the query.
 */
const VerifySchema = z.object({
	token: z.string(),
});

/**
 * Fastify plugin to handle the "/verify" route.
 */
const verifyRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Verify Account",
			description: "Verifies the user account using the provided token",
			tags: ["Authentication"],
			querystring: VerifySchema,
			response: { 200: ResetPasswordResultSchema },
		},
		handler: async (request, reply) => {
			const { token } = request.query;

			// Query to check if a user exists with the provided verification token
			const users = await authDatabase.query.userVerificationRequest.findMany({
				where: (users, { eq }) => eq(users.token, token),
				with: {
					user: true, // Fetch the user related to the verification request
				},
			});

			if (users.length === 0) {
				throw new AppError("No user found with that verification token.", 404);
			}

			const userVerificationRequest = users[0];

			// Update user as verified
			const user = userVerificationRequest.user;
			user.verification = {
				verified: true,
				token: undefined,
				time: new Date().toISOString(),
			};

			await authDatabase
				.update(userVerificationRequest.user)
				.set(user.verification);

			// Run any account setup tasks
			try {
				await setupUserAccount(user);
			} catch (error) {
				fastify.log.error(
					`Error setting up account for user ${user.email}:`,
					error,
				);
				throw fastify.httpErrors.internalServerError("Error setting up account");
			}

			return reply.send({ message: "Account verified" });
		},
	});
};

export default verifyRoutes;

/**
 * Simulated setup function, customize as needed.
 */
async function setupUserAccount(user: any) {
	// Run any setup tasks for the user account here
}
