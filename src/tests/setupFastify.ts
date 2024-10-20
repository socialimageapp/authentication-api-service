/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
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
import config from "src/configs/api";
import registerRoutes from "src/routes/v1/register";
import verifyRoutes from "src/routes/v1/verify";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupFastify = async () => {
	const DOCS_PATH = config.docsPath ?? "/documentation";
	const fastify = Fastify({ logger: false });
	fastify.setValidatorCompiler(validatorCompiler);
	fastify.setSerializerCompiler(serializerCompiler);
	await fastify.register(helmet);

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
			schemas: {
				User: UserSchema,
				Organization: OrganizationSchema,
			},
		}),
		hiddenTag: "hidden",
		openapi: {
			openapi: "3.1.0",
			info: {
				title: `${config.appName ?? "YOUR APP"} Authentication API`,
				description: config.description ?? "Authentication API",
				version: config.version ?? "1.0.0",
			},
			servers: [
				{
					url: `http://localhost:${process.env.PORT || "3000"}`,
					description: "Development server",
				},
			],
			tags: [
				{
					name: "Authentication",
					description: "Authentication related end-points",
				},
				{ name: "Users", description: "User related end-points" },
				{
					name: "Organizations",
					description: "Organization related end-points",
				},
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

	await fastify.register(fastifySwaggerUI, { routePrefix: DOCS_PATH });

	fastify.setNotFoundHandler((req) => {
		throw new NotFoundError(`This is not the route you are looking for: ${req.url}`);
	});
	fastify.setErrorHandler((error, request, reply) => {
		if (hasZodFastifySchemaValidationErrors(error)) {
			return reply.code(400).send({
				error: {
					type: "RequestValidationError",
					message:
						"Response Validation Error - Request doesn't match the schema",
					statusCode: 400,
					details: {
						issues: error.validation,
						method: request.method,
						url: request.url,
					},
				},
			});
		}

		if (isResponseSerializationError(error)) {
			return reply.code(500).send({
				error: {
					type: "ResponseSerializationError",
					message: "Response doesn't match the schema",
					statusCode: 500,
					details: {
						issues: error.cause.issues,
						method: error.method,
						url: error.url,
					},
				},
			});
		}
		fastify.log.error(error);
		const statusCode = error.statusCode || 500;
		reply
			.code(statusCode)
			.type("application/json")
			.send({
				error: {
					type: error.name,
					statusCode,
					error: "Not found error",
					message: error.message,
				},
			});
	});

	await fastify.register(registerRoutes, { prefix: "/api/v1/register" });
	await fastify.register(verifyRoutes, { prefix: "/api/v1/verify" });
	await fastify.ready();
	return fastify;
};
