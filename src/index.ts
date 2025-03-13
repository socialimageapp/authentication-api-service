/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import Fastify from "fastify";
import path, { join } from "path";
import fastifyFavicon from "fastify-favicon";
import autoLoad from "@fastify/autoload";
import { setupFastify } from "./setupFastify.js";
import config from "./configs/api.js";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || "3000";
const DOCS_PATH = config.docsPath ?? "/documentation";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const fastify = await setupFastify(Fastify({ logger: true }));

await fastify.register(fastifyFavicon, { path: path.join(__dirname, "../") });
await fastify.register(autoLoad, {
	dir: join(__dirname, "plugins"),
});
await fastify.register(autoLoad, {
	dir: join(__dirname, "routes/v1"),
	options: { prefix: config.basePath.v1 },
	ignoreFilter: (path) => path.endsWith(".test.ts"),
});
await fastify.ready();
fastify.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	console.log(`Server is running on ${address}`);
});
console.log(`Documentation running at http://localhost:${PORT}${DOCS_PATH}`);

// Handle graceful shutdown
process.on("exit", function () {
	console.log("Server is shutting down");
});
	