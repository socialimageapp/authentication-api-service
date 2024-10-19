/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	authDatabase,
	ResetPasswordResultSchema,
	userVerificationRequests,
} from "@adventurai/shared-types";
import AppError from "src/utils/errors/AppError";
import { eq } from "drizzle-orm";

const VerifySchema = z.object({
	token: z.string(),
});

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

			const users = await authDatabase.query.userVerificationRequests.findMany({
				where: (users, { eq }) => eq(users.token, token),
				with: { user: true },
			});

			if (users.length === 0) {
				throw new AppError("No user found with that verification token.", 404);
			}

			const userVerificationRequest = users[0];

			const user = userVerificationRequest.user;
			user.verification = {
				verified: true,
				verificationCode: "",
			};

			await authDatabase
				.delete(userVerificationRequests)
				// @ts-expect-error - ORM types are not correct
				.where(eq(userVerificationRequests.id, userVerificationRequest.id));

			try {
				await setupUserAccount(user);
			} catch (error) {
				fastify.log.error(
					`Error setting up account for user ${user.email}:`,
					error,
				);
				throw new AppError("Error setting up account", 500);
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
