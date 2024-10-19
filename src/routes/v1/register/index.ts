/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import {
	authDatabase,
	RegisterPostPayloadSchema,
	RegisterResultSchema,
	User,
	users,
	withResult,
} from "@adventurai/shared-types";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendEmail, senders } from "src/utils/email";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import AppError from "src/utils/errors/AppError";

/**
 * Hashes a plain-text password using bcrypt.
 * @param password - The plain-text password to hash.
 * @returns - The hashed password.
 */
async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	const salt = await bcrypt.genSalt(saltRounds);
	return await bcrypt.hash(password, salt);
}

/**
 * Generates a cryptographically secure verification code.
 * @returns - The verification code as a hex string.
 */
function generateVerificationCode(length: number): string {
	return crypto.randomBytes(length).toString("hex");
}

const registerRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Register",
			description: "Register a new user",
			tags: ["Authentication", "hidden"],
			body: RegisterPostPayloadSchema,
			response: { 200: withResult(RegisterResultSchema) },
		},
		handler: async (request, reply) => {
			const { email, password, firstName, lastName } = request.body;

			const existingUsers = (await authDatabase.query.users.findMany({
				where: (users, { eq }) => eq(users.email, email),
			})) as User[];
			if (existingUsers.length > 0) {
				if (existingUsers[0].verification?.verified === true) {
					throw new AppError("User with this email already exists.", 400);
				}
				await authDatabase
					.update(users)
					.set({
						verification: {
							verified: false,
							verificationCode: generateVerificationCode(6),
						},
					})
					// @ts-expect-error - We are using the wrong type for the update set
					.where(eq(users.email, email));
			}

			const hashedPassword = await hashPassword(password);
			const verificationCode = generateVerificationCode(6);
			const newUser = await authDatabase
				.insert(users)
				.values({
					// @ts-expect-error - We are using the wrong type for the insert values
					email,
					password: hashedPassword,
					firstName,
					lastName,
					enrolled: "false",
					username: email,
					userType: "user",
					verification: {
						verified: false,
						token: verificationCode,
						time: new Date().toISOString(),
					},
				})
				.returning();

			await sendEmail({
				dynamicTemplateData: {
					name: `${firstName} ${lastName}`,
					verificationCode,
				},
				email: newUser[0].email,
				template: "confirmEmail",
				sender: senders.contact,
			});

			return reply.send({
				result: {
					message: "Registration successful. Please verify your email.",
					userId: newUser[0].id,
				},
			});
		},
	});
};

export default registerRoutes;
