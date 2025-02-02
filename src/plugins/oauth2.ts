import fastifyPlugin from "fastify-plugin";
import oauthPlugin, { FastifyOAuth2Options } from "@fastify/oauth2";
import config from "src/configs/api.js";

const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!;
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;

const authConfig: FastifyOAuth2Options = {
	name: "googleOAuth2",
	scope: ["profile", "email"],
	credentials: {
		client: { id: GOOGLE_OAUTH_CLIENT_ID, secret: GOOGLE_OAUTH_CLIENT_SECRET },
		auth: oauthPlugin.fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: `${config.basePath.v1}/login/google/test`,
	callbackUri: (req) =>
		req.hostname === "localhost"
			? `${req.protocol}://localhost:${process.env.PORT || 7071}${config.basePath.v1}/login/google/callback`
			: `${req.protocol}://${req.hostname}${config.basePath.v1}/login/google/callback`,
	callbackUriParams: {
		access_type: "offline",
	},
	pkce: "S256",
};

export default fastifyPlugin(async function (fastify) {
	fastify.register(oauthPlugin, authConfig);
});
