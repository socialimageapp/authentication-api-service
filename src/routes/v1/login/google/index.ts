import { User, users, withResult } from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { OAuth2Namespace } from "@fastify/oauth2";
import { authDatabase } from "src/configs/db.js";
import { hashPassword } from "src/routes/v1/register/index.js";
import crypto from "crypto";

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
	}
}

const loginRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			summary: "Login with Google Auth Code",
			description:
				"Handles login of user with code and code verifier using PKCE flow",
			tags: ["Authentication"],
			body: z.object({
				code: z.string(),
				codeVerifier: z.string(),
			}),
			response: {
				200: withResult(
					z.object({
						token: z.string(),
						user: z.object({
							sub: z.string(),
							email: z.string(),
							email_verified: z.boolean(),
							name: z.string(),
							picture: z.string(),
						}),
					}),
				),
			},
		},
		handler: async (request, reply) => {
			if (fastify.googleOAuth2 === undefined) {
				throw new Error("OAuth2Google is not initialized");
			}
			const response = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				body: JSON.stringify({
					code: request.body.code,
					client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
					client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
					redirect_uri: process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
					grant_type: "authorization_code",
					code_verifier: request.body.codeVerifier,
				}),
				headers: { "Content-Type": "application/json" },
			});
			const json = (await response.json()) as {
				access_token: string;
				id_token: string;
				refresh_token: string;
			};
			const { access_token } = json;
			const userInfo = (await fetch(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{ headers: { Authorization: `Bearer ${access_token}` } },
			).then((res) => res.json())) as
				| {
						sub: string;
						email: string;
						email_verified: boolean;
						name: string;
						picture: string;
						given_name: string;
						family_name: string;
				  }
				| { error: string; error_description: string };

			if ("error" in userInfo) {
				throw new Error(`Failed to get user info: ${userInfo.error_description}`);
			}

			const existingUsers = (await authDatabase.query.users.findMany({
				where: (users, { eq }) => eq(users.email, userInfo.email),
			})) as User[];
			if (existingUsers.length > 0) {
				const user = existingUsers[0];
				const authToken = fastify.jwt.sign(
					{ sub: user.id, email: user, role: user.userType },
					{ expiresIn: "1h" },
				);
				return reply.send({
					result: { token: authToken, user: userInfo },
				});
			} else {
				const hashedPassword = await hashPassword(
					crypto.randomBytes(10).toString("hex"),
				);
				const userPayload = {
					email: userInfo.email,
					password: hashedPassword,
					firstName: userInfo.given_name,
					lastName: userInfo.family_name,
					enrolled: false,
					username: userInfo.email,
					userType: "user",
					verified: false,
				};
				const newUser = await authDatabase
					.insert(users)
					.values(userPayload)
					.returning();

				const user = newUser[0];
				const authToken = fastify.jwt.sign(
					{ sub: user.id, email: user, role: user.userType },
					{ expiresIn: "1h" },
				);
				return reply.send({
					result: { token: authToken, user: userInfo },
				});
			}
		},
	});
};

export default loginRoutes;
