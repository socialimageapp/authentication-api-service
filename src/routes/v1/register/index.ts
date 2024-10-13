/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import {
	authDatabase,
	RegisterPostPayloadSchema,
	RegisterResultSchema,
} from "@adventurai/shared-types";
import baseRouter from "src/api/baseRouter.js";
import {
	buildRouteSpecs,
	createMethodSpec,
	createRouteSpec,
} from "src/api/buildRouteSpec/buildRouteSpec.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { usersTable } from "lib/ast/dist/db/auth/schema.js";

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
 * Generates a cryptographically secure verification token.
 * @returns - The verification token as a hex string.
 */
function generateVerificationToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

export const specification = createRouteSpec({
	path: "/register",
	methods: {
		post: createMethodSpec({
			auth: "public",
			schema: {
				body: RegisterPostPayloadSchema,
				result: RegisterResultSchema,
			},
			handler: async ({ body }) => {
				const { email, password, firstName, lastName } = body;
				const existingUsers = await authDatabase.query.usersTable.findMany({
					where: (users, { eq }) => eq(users.email, email),
				});
				if (existingUsers.length > 0) {
					throw new Error("Email in use.");
				}
				const hashedPassword = await hashPassword(password);
				const newUser = await authDatabase
					.insert(usersTable)
					.values({
						email,
						password: hashedPassword,
						firstName,
						enrolled: "false",
						username: email,
						userType: "user",
						lastName,
						verification: {
							verified: false,
							token: generateVerificationToken(),
							time: new Date().toISOString(),
						},
					})
					.returning();
				return {
					message: "Registration successful. Please verify your email.",
					userId: newUser[0].id,
				};
			},
		}),
	},
});

buildRouteSpecs(baseRouter, [specification]);

export default baseRouter;
