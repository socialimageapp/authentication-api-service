/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fileURLToPath } from "url";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
	createJsonSchemaTransformObject,
} from "fastify-type-provider-zod";
import helmet from "@fastify/helmet";
import { NotFoundError, OrganizationSchema, UserSchema } from "@adventurai/shared-types";
import config, { Environment } from "src/configs/api.js";
import registerRoutes from "src/routes/v1/register/index.js";
import verifyRoutes from "src/routes/v1/verify/index.js";
import loginRoutes from "src/routes/v1/login/google/callback/index.js";
import dotenv from "dotenv";
import path, { resolve } from "path";
import { readFile } from "fs/promises";
import fastifyJwt from "@fastify/jwt";
import meRoutes from "./routes/v1/me/index.js";
import forgotPasswordRoutes from "./routes/v1/forgot-password/index.js";
import AppError from "./utils/errors/AppError.js";
import cookie from "@fastify/cookie";

export const setupFastify = async (fastify: FastifyInstance) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const env = process.env.MODE as Environment | undefined;
	if (!env) {
		throw new Error("MODE env variable is not set");
	}
	
	const envPath = path.join(__dirname, `../.config/environments/.env.${env}`);

	dotenv.config({ path: envPath });

	const DOCS_PATH = config.docsPath ?? "/documentation";
	const PORT = process.env.PORT || "3000";

	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);

	await fastify.register(helmet);
	await fastify.register(cookie, {});
	await fastify.register(fastifyJwt, {
		secret: process.env.JWT_SECRET || "secr3t",
	});
	await fastify.register(fastifyStatic, {
		root: path.join(__dirname, "../public"),
		prefix: "/public/",
	});
	await fastify.register(import("@fastify/rate-limit"), {
		max: 100,
		timeWindow: "1 minute",
	});
	await fastify.register(fastifySwagger, {
		transform: jsonSchemaTransform,
		transformObject: createJsonSchemaTransformObject({
			schemas: { User: UserSchema, Organization: OrganizationSchema },
		}),
		hiddenTag: "hidden",
		openapi: {
			openapi: "3.1.0",
			info: {
				title: `${config.appName ?? "YOUR AI WRAPPER"} Authentication API`,
				description:
					config.description ??
					"YOUR API DESCRIPTION for the Authentication API",
				version: config.version ?? "1.0.0",
			},
			servers: [
				{ url: `http://127.0.0.1:${PORT}`, description: "Development server" },
				{ url: `https://staging.app.adventur.ai/api/auth/v1`, description: "Staging server" },
				{ url: `https://app.adventur.ai/api/auth/v1`, description: "Production server" },
			],
			tags: [
				{
					name: "Authentication",
					description: "Authentication related end-points",
				},
				{ name: "Users", description: "User related end-points" },
				{ name: "Organizations", description: "Organization related end-points" },
				{ name: "Roles", description: "Role related end-points" },
				{
					name: "Organization Roles",
					description: "Organization Role related end-points",
				},
				{ name: "OAuth2", description: "OAuth2 related end-points" },
			],
			components: {
				securitySchemes: {
					apiKey: { type: "apiKey", name: "apiKey", in: "header" },
				},
			},
			externalDocs: {
				url: "https://swagger.io",
				description: "Find more info here",
			},
		},
	});
	await fastify.register(fastifyCors, {
		origin: [config.allowedOrigins],
		methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});
	const logo: Buffer = await readFile(resolve(__dirname, "../public/logo.png"));
	const favicon: Buffer = await readFile(resolve(__dirname, "../public/favicon.ico"));
	await fastify.register(fastifySwaggerUI, {
		routePrefix: DOCS_PATH,
		logo: { type: "image/png", content: logo, href: DOCS_PATH, target: "_blank" },
		theme: {
			title: `${config.appName ?? "YOUR AI WRAPPER"} Authentication API`,
			favicon: [
				{
					filename: "favicon.png",
					rel: "icon",
					sizes: "16x16",
					type: "image/png",
					content: favicon,
				},
			],
		},
	});
	fastify.decorate(
		"authenticate",
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				await request.jwtVerify();
			} catch (err) {
				reply.send(err);
			}
		},
	);

	fastify.setNotFoundHandler((req) => {
		throw new NotFoundError(`This is not the route you are looking for: ${req.url}`);
	});
	fastify.setErrorHandler((error, { method, url }, reply) => {
		if (hasZodFastifySchemaValidationErrors(error)) {
			const { validation: issues } = error;
			return reply.code(400).send({
				error: {
					type: "RequestValidationError",
					message:
						"Response Validation Error - Request doesn't match the schema",
					statusCode: 400,
					details: { issues, method, url },
				},
			});
		}
		if (isResponseSerializationError(error)) {
			const { cause, method, url } = error;
			const { issues } = cause;
			return reply.code(500).send({
				error: {
					type: "ResponseSerializationError",
					message: "Response doesn't match the schema",
					statusCode: 500,
					details: { issues, method, url },
				},
			});
		}
		if (error instanceof AppError) {
			const statusCode = error.statusCode || 500;
			const { message } = error;
			reply
				.code(statusCode)
				.type("application/json")
				.send({
					error: {
						type: error.type,
						statusCode,
						message,
						details: { method, url },
					},
				});
		}
		fastify.log.error(error);
		const statusCode = error.statusCode || 500;
		const { message } = error;
		reply
			.code(statusCode)
			.type("application/json")
			.send({
				error: {
					type: "InternalServerError",
					statusCode,
					message,
					details: { method, url },
				},
			});
	});

	return fastify;
};

export const setupFastifyTestEnv = async (fastify: FastifyInstance) => {
	await setupFastify(fastify);

	await fastify.register(registerRoutes, { prefix: "/api/v1/register" });
	await fastify.register(forgotPasswordRoutes, {
		prefix: "/api/v1/forgot-password",
	});
	await fastify.register(verifyRoutes, { prefix: "/api/v1/verify" });
	await fastify.register(loginRoutes, { prefix: "/api/v1/login" });
	await fastify.register(meRoutes, { prefix: "/api/v1/me" });
	await fastify.ready();
	return fastify;
};
