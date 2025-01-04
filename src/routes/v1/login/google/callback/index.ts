import { withResult } from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import "src/";
import { OAuth2Namespace } from "@fastify/oauth2";

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
			const { token } =
				await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
					request,
					reply,
				);
			const userInfo = await fetch(
				"https://www.googleapis.com/oauth2/v3/userinfo",
				{
					headers: {
						Authorization: `Bearer ${token.access_token}`,
					},
				},
			).then((res) => res.json());
			return {
				result: {
					accessToken: token.access_token,
					user: {
						sub: userInfo.sub,
						email: userInfo.email,
						email_verified: userInfo.email_verified,
						name: userInfo.name,
						picture: userInfo.picture,
					},
				},
			};
		},
	});
};

export default loginRoutes;
