/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import Fastify from "fastify";
import path, { join, resolve } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fastifySwagger from "@fastify/swagger";
import fastifyFavicon from "fastify-favicon";
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
import autoLoad from "@fastify/autoload";
import helmet from "@fastify/helmet";
import { NotFoundError, OrganizationSchema, UserSchema } from "@adventurai/shared-types";
import config from "./configs/api";
import { readFile } from "fs/promises";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
	path: path.join(
		__dirname,
		`../.config/environments/.env.${process.env.ENV ?? "local"}`,
	),
});

const DOCS_PATH = config.docsPath ?? "/documentation";

const PORT = process.env.PORT || "3000";

const fastify = Fastify({ logger: true });
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
await fastify.register(helmet);
// Favicon
await fastify.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/public/",
});
await fastify.register(fastifyFavicon, {
	path: path.join(__dirname, "../"),
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
			title: `${config.appName ?? "YOUR AI WRAPPER"} Authentication API`,
			description:
				config.description ?? "YOUR API DESCRIPTION for the Authentication API",
			version: config.version ?? "1.0.0",
		},
		servers: [{ url: `http://localhost:${PORT}`, description: "Development server" }],
		tags: [
			{ name: "Authentication", description: "Authentication related end-points" },
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
			securitySchemes: { apiKey: { type: "apiKey", name: "apiKey", in: "header" } },
		},
		externalDocs: { url: "https://swagger.io", description: "Find more info here" },
	},
});
const logo: Buffer = await readFile(resolve(__dirname, "../public/logo.png"));
const favicon: Buffer = await readFile(resolve(__dirname, "../public/favicon.ico"));
await fastify.register(fastifySwaggerUI, {
	routePrefix: DOCS_PATH,
	logo: {
		type: "image/png",
		content: logo,
		href: DOCS_PATH,
		target: "_blank",
	},
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

fastify.setNotFoundHandler((req) => {
	throw new NotFoundError(`This is not the route you are looking for: ${req.url}`);
});
fastify.setErrorHandler((error, request, reply) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.code(400).send({
			error: {
				type: "RequestValidationError",
				message: "Response Validation Error - Request doesn't match the schema",
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

await fastify.register(autoLoad, {
	dir: join(__dirname, "routes/v1"),
});
await fastify.ready();
fastify.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	//eslint-disable-next-line no-console
	console.log(`Server is running on ${address}`);
});
// eslint-disable-next-line no-console
console.log(`Documentation running at http://localhost:${PORT}${DOCS_PATH}`);

// Handle graceful shutdown
process.on("exit", function () {
	// eslint-disable-next-line no-console
	console.log("Server is shutting down");
});
