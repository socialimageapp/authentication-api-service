import { User, users, withResult } from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { OAuth2Namespace } from "@fastify/oauth2";
import { authDatabase } from "src/configs/db.js";
import { hashPassword } from "src/routes/v1/register/index.js";
import crypto from "crypto";
import AppError from "src/utils/errors/AppError.js";

declare module "fastify" {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
	}
}

const loginRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Callback from Google Auth",
			description: "Handles the callback from Google OAuth2",
			tags: ["Authentication"],
			response: {
				200: withResult(
					z.object({
						accessToken: z.string(),
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
			const { token } = await fastify.googleOAuth2
				.getAccessTokenFromAuthorizationCodeFlow(request, reply)
				.catch(() => {
					throw new AppError("Failed to get access token", 403, "Failed");
				});
			const userInfo = (await fetch(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{ headers: { Authorization: `Bearer ${token.access_token}` } },
			).then((res) => res.json())) as {
				sub: string;
				email: string;
				email_verified: boolean;
				name: string;
				picture: string;
				given_name: string;
				family_name: string;
			};
			const existingUsers = (await authDatabase.query.users.findMany({
				where: (users, { eq }) => eq(users.email, userInfo.email),
			})) as unknown as User[];

			if (existingUsers.length > 0) {
				const user = existingUsers[0];
				const authToken = fastify.jwt.sign(
					{ sub: user.id, email: user, role: user.userType },
					{ expiresIn: "1h" },
				);
				return reply
					.setCookie("accessToken", authToken, {
						secure: false,
						sameSite: "none",
						path: "/",
						httpOnly: true,
					})
					.redirect(`${process.env.FRONTEND_URL as string}/`);
			} else {
				const hashedPassword = await hashPassword(
					crypto.randomBytes(length).toString("hex"),
				);
				const newUser = await authDatabase
					.insert(users)
					.values({
						email: userInfo.email,
						password: hashedPassword,
						firstName: userInfo.given_name,
						lastName: userInfo.family_name,
						enrolled: false,
						username: userInfo.email,
						userType: "user",
						verified: false,
					})
					.returning();

				const user = newUser[0];
				const authToken = fastify.jwt.sign(
					{ sub: user.id, email: user, role: user.userType },
					{ expiresIn: "1h" },
				);
				return reply
					.setCookie("accessToken", authToken, {
						secure: false,
						sameSite: "none",
						path: "/",
						httpOnly: true,
					})
					.redirect(`${process.env.FRONTEND_URL as string}/`);
			}
		},
	});
};

export default loginRoutes;
