/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
	ConfirmEmailPayloadSchema,
	Email,
	ResetPasswordResultSchema,
	User,
	users,
	userVerificationRequests,
	withResult,
} from "@adventurai/shared-types";
import AppError from "src/utils/errors/AppError.js";
import { eq } from "drizzle-orm";
import { authDatabase } from "src/configs/db.js";
import { FastifyInstance } from "fastify";
import { createOrganization } from "src/utils/organization/createOrganization.js";

async function setupUserAccount(user: User, fastify: FastifyInstance) {
	try {
		const result = await createOrganization({
			name: "My First Organization",
			user,
			description: "My First Organization",
		});

		fastify.log.info(
			`Created organization ${result.organization.name} for user ${user.email}`,
		);

		return result;
	} catch (error) {
		fastify.log.error(error);
		throw new AppError("Error setting up account", 500, "");
	}
}

/**
 * Confirms the user email with email and token
 */
const confirmUserEmail = async (
	email: Email,
	token: string,
	fastify: FastifyInstance,
) => {
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
			summary: "Confirm Email",
			description: "Verifies the user account using the provided code and email",
			tags: ["Authentication"],
			body: ConfirmEmailPayloadSchema,
			response: { 200: withResult(ResetPasswordResultSchema) },
		},
		handler: async (request, reply) => {
			const { token, email } = request.body;
			await confirmUserEmail(email, token, fastify);
			return reply.send({ result: { message: "Account verified" } });
		},
	});
	fastify.get("/", {
		schema: {
			summary: "Verify Account",
			description: "Verifies the user account using the provided code and email",
			tags: ["Authentication"],
			querystring: ConfirmEmailPayloadSchema,
			response: { 200: withResult(ResetPasswordResultSchema) },
		},
		handler: async (request, reply) => {
			const { token, email } = request.query;
			await confirmUserEmail(email, token, fastify);
			return reply.send({ result: { message: "Account verified" } });
		},
	});
};

export default verifyRoutes;
