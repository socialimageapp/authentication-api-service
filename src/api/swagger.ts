/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import swaggerUi from "swagger-ui-express";
import fs from "fs/promises";
import path from "path";
import deepmerge from "deepmerge";
import { fileURLToPath } from "url";
import type { Router } from "express";
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to load and merge partial OpenAPI files for each version
const loadPartialOpenAPI = async (dirPath: string): Promise<any> => {
	let openAPIDoc = { openapi: "3.0.0", info: {}, paths: {} };

	// Recursively find all openapi.json files in the route folders
	const files = await fs.readdir(dirPath, { withFileTypes: true });

	for (const file of files) {
		const fullPath = path.join(dirPath, file.name);

		if (file.isDirectory()) {
			const subDoc = await loadPartialOpenAPI(fullPath);
			openAPIDoc = deepmerge(openAPIDoc, subDoc);
		} else if (file.name === "openapi.json") {
			const fileContent = await fs.readFile(fullPath, "utf-8");
			const partialDoc = JSON.parse(fileContent);
			openAPIDoc = deepmerge(openAPIDoc, partialDoc);
		}
	}

	return openAPIDoc;
};

// Setup Swagger UI for specific versions
const setupSwaggerForVersion = async (
	app: Router,
	versionPath: string,
	servers: string[],
): Promise<Router> => {
	const versionedBasePath =
		config.basePath[versionPath as keyof typeof config.basePath];
	const baseOpenAPI = {
		openapi: "3.0.0",
		info: {
			title: "Authentication API Service Documentation ",
			version: versionPath,
			description: `API documentation for ${versionPath}`,
		},
		servers: servers.map((server) => ({ url: server })),
	};

	// Load partial OpenAPI definitions from the versioned routes folder
	const routesOpenAPI = await loadPartialOpenAPI(path.join(__dirname, "../routes/v1"));
	const swaggerSpec = deepmerge(baseOpenAPI, routesOpenAPI);

	// Serve Swagger UI for the specific version
	console.log("Setting up Swagger UI for version", `${versionedBasePath}/docs`);
	app.use(`${versionedBasePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	return app;
};

export default setupSwaggerForVersion;
