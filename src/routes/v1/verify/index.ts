/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	organizations,
	organizationUsers,
	ResetPasswordResultSchema,
	User,
	UserIdSchema,
	users,
	userVerificationRequests,
} from "@adventurai/shared-types";
import AppError from "src/utils/errors/AppError";
import { eq } from "drizzle-orm";
import { authDatabase } from "src/configs/db";
import { FastifyInstance } from "fastify";

const VerifySchema = z.object({ token: z.string(), userId: UserIdSchema });

async function setupUserAccount(user: User, fastify: FastifyInstance) {
	const org = await authDatabase
		.insert(organizations)
		.values({
			ownerId: user.id,
			name: "My First Organization",
			slug: crypto.randomUUID(),
			description: "My First Organization",
		})
		.returning();
	fastify.log.info(`Created organization ${org[0].name} for user ${user.email}`);
	await authDatabase.insert(organizationUsers).values({
		organizationId: org[0].id,
		userId: user.id,
		roles: ["owner"],
	});
}

const verifyRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Verify Account",
			description: "Verifies the user account using the provided code",
			tags: ["Authentication"],
			querystring: VerifySchema,
			response: { 200: ResetPasswordResultSchema },
		},
		handler: async (request, reply) => {
			const { token } = request.query;

			const foundUserVerificationRequests =
				await authDatabase.query.userVerificationRequests.findMany({
					where: (requests, { eq, and }) =>
						and(eq(requests.token, token), eq(requests.type, "email")),
					with: { user: true },
				});
			if (foundUserVerificationRequests.length === 0) {
				throw new AppError("No user found with that verification token.", 404);
			}

			const userVerificationRequest = foundUserVerificationRequests[0];

			const user = userVerificationRequest.user;

			await authDatabase
				.update(users)
				.set({ verified: true })
				.where(eq(users.id, user.id));
			await authDatabase
				.delete(userVerificationRequests)
				.where(eq(userVerificationRequests.id, userVerificationRequest.id));

			try {
				await setupUserAccount(user as User, fastify);
			} catch (error) {
				fastify.log.error(error);
				throw new AppError("Error setting up account", 500);
			}

			return reply.send({ message: "Account verified" });
		},
	});
};

export default verifyRoutes;
