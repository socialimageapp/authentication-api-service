/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { authDatabase, ResetPasswordResultSchema } from "@adventurai/shared-types";
import baseRouter from "src/api/baseRouter.js";
import {
	buildRouteSpecs,
	createMethodSpec,
	createRouteSpec,
} from "src/api/buildRouteSpec/buildRouteSpec.js";
import { z } from "zod";

const verifySchema = z.object({ token: z.string() });

const setupUserAccount = async () => {
	// Run any setup tasks for the user account here
};

// Define your RouteSpec using helper functions
export const specification = createRouteSpec({
	path: "/verify",
	methods: {
		get: createMethodSpec({
			auth: "public",
			schema: {
				query: verifySchema,
				result: ResetPasswordResultSchema,
			},
			handler: async ({ query }) => {
				const { token } = query;
				const users =
					await authDatabase.query.userVerificationRequest.findMany({
						where: (users, { eq }) => eq(users.token, token),
						with: {
							user: 
						}
					});

				if (users.length === 0) {
					throw new Error("No user found with that verification token.");
				}
				const userVerificationRequest = users[0];
				// Update user as verified
				user.verification = {
					verified: true,
					token: undefined,
					time: new Date().toISOString(),
				};
				await user.save();

				// Run setup function now that the account is verified
				try {
					// await setupUserAccount(user);
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error(
						`Error setting up account for user ${user.email}:`,
						error,
					);
					throw new Error("Error setting up account");
				}

				return { message: "Account verified" };
			},
		}),
	},
});
buildRouteSpecs(baseRouter, [specification]);
export default baseRouter;
