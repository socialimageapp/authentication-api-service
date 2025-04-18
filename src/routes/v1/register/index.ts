import {
	RegisterPostPayloadSchema,
	RegisterResultSchema,
	User,
	UserId,
	users,
	UserVerificationRequest,
	userVerificationRequests,
	withResult,
} from "@adventurai/shared-types";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { senders } from "src/utils/email.js";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import AppError from "src/utils/errors/AppError.js";
import { authDatabase } from "src/configs/db.js";
import { FastifyInstance } from "fastify";
import { emailQueue } from "src/queues/email.js";

const AUTH_MESSAGES = {
	LOGIN_FAILED: "Invalid email or password",
	ACCOUNT_CREATED:
		"If the email is not already registered, a confirmation email will be sent",
	PASSWORD_RESET:
		"If an account exists with this email, password reset instructions will be sent",
	EMAIL_CONFIRMATION: "If the email exists, a confirmation email has been sent",
	ACCOUNT_LOCKED: "Too many failed attempts. Please try again later.",
} as const;

/**
 * Hashes a plain-text password using bcrypt.
 * @param password - The plain-text password to hash.
 * @returns - The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	const salt = await bcrypt.genSalt(saltRounds);
	return await bcrypt.hash(password, salt);
}

/**
 * Generates a cryptographically secure verification code.
 * @returns - The verification code as a hex string.
 */
export function generateVerificationCode(length: number): string {
	return crypto.randomBytes(length).toString("hex");
}
/**
 * Generates a cryptographically secure verification code.
 * @returns - The verification code as a hex string.
 */
function generateVerificationCodeNumber(): number {
	return crypto.randomInt(0, 1000000);
}

const sendNewAuthenticationRequest = async (
	userId: UserId,
	fastify: FastifyInstance,
): Promise<UserVerificationRequest> => {
	const verificationRequest = await authDatabase
		.insert(userVerificationRequests)
		.values({
			userId,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			token: generateVerificationCodeNumber().toString(),
			type: "email",
		})
		.returning();
	// Get the user's email
	const user = await authDatabase.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	});
	if (!user) {
		fastify.log.info("Found user:", user);
		throw new AppError(AUTH_MESSAGES.ACCOUNT_CREATED, 404, "UserNotFound");
	}
	const sent = await emailQueue.add("sendEmail", {
		dynamicTemplateData: {
			name: `${user.firstName} ${user.lastName}`,
			verificationCode: verificationRequest[0].token,
		},
		email: user.email,
		template: "confirmEmail",
		subject: "Confirm your email",
		sender: senders.contact,
	});
	fastify.log.warn(`Email sent: ${sent}`);
	return verificationRequest[0] as unknown as UserVerificationRequest;
};

const registerRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Register",
			description: "Register a new user",
			tags: ["Authentication"],
			body: RegisterPostPayloadSchema,
			response: { 200: withResult(RegisterResultSchema) },
		},
		handler: async (request, reply) => {
			const { email, password, firstName, lastName } = request.body;

			const existingUsers = (await authDatabase.query.users.findMany({
				where: (users, { eq }) => eq(users.email, email),
			})) as unknown as User[];

			if (existingUsers.length > 0) {
				if (existingUsers[0].verified === true) {
					throw new AppError(
						"User with this email already exists.",
						400,
						"UserExistsLoginRequired",
					);
				}

				await sendNewAuthenticationRequest(existingUsers[0].id, fastify);

				return reply.send({
					result: {
						message: "User already exists. Please verify your email.",
						userId: existingUsers[0].id,
					},
				});
			}
			const hashedPassword = await hashPassword(password);
			const newUser = await authDatabase
				.insert(users)
				.values({
					email,
					password: hashedPassword,
					firstName,
					lastName,
					enrolled: false,
					username: email,
					userType: "user",
					verified: false,
				})
				.returning();
			await sendNewAuthenticationRequest(newUser[0].id as UserId, fastify);
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
