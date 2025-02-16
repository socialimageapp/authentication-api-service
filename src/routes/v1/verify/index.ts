/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
	organizations,
	organizationUsers,
	ResetPasswordResultSchema,
	User,
	users,
	userVerificationRequests,
	VerifyEmailPayloadSchema,
	withResult,
} from "@adventurai/shared-types";
import AppError from "src/utils/errors/AppError.js";
import { eq } from "drizzle-orm";
import { authDatabase } from "src/configs/db.js";
import { FastifyInstance } from "fastify";

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
	await authDatabase.insert(organizationUsers).values([{
		organizationId: org[0].id,
		userId: user.id
	}]);
}

const verifyUser = async (token: string, fastify: FastifyInstance) => {
	const foundUserVerificationRequests =
		await authDatabase.query.userVerificationRequests.findMany({
			where: (requests, { eq, and }) => and(eq(requests.token, token)),
			with: { user: true },
		});
	if (foundUserVerificationRequests.length === 0) {
		throw new AppError("User Id or Verification Token is Invalid", 400, "");
	}

	const userVerificationRequest = foundUserVerificationRequests[0];

	const user = userVerificationRequest.user;

	const currentUser = await authDatabase.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, user.email),
	});

	if (currentUser?.verified === false) {
		await authDatabase
			.update(users)
			.set({ verified: true })
			.where(eq(users.id, user.id));
		try {
			await setupUserAccount(user as unknown as User, fastify);
		} catch (error) {
			fastify.log.error(error);
			throw new AppError("Error setting up account", 500, "");
		}
	}
	await authDatabase
		.delete(userVerificationRequests)
		.where(eq(userVerificationRequests.id, userVerificationRequest.id));
};

const verifyRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Verify Account",
			description: "Verifies the user account using the provided token",
			tags: ["Authentication"],
			body: VerifyEmailPayloadSchema,
			response: { 200: withResult(ResetPasswordResultSchema) },
		},
		handler: async (request, reply) => {
			const { token } = request.body;
			await verifyUser(token, fastify);
			return reply.send({ result: { message: "Account verified" } });
		},
	});
	fastify.get("/", {
		schema: {
			summary: "Verify Account",
			description: "Verifies the user account using the provided token",
			tags: ["Authentication"],
			querystring: VerifyEmailPayloadSchema,
			response: { 200: withResult(ResetPasswordResultSchema) },
		},
		handler: async (request, reply) => {
			const { token } = request.query;
			await verifyUser(token, fastify);
			return reply.send({ result: { message: "Account verified" } });
		},
	});
};

export default verifyRoutes;
