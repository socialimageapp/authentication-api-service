/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import fs from "fs/promises";
import path from "path";
import deepmerge from "deepmerge";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Utility function to load and merge partial OpenAPI files
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

const setupSwagger = async (app: Express) => {
	const baseOpenAPI = {
		openapi: "3.0.0",
		info: {
			title: "My Express API",
			version: "1.0.0",
			description: "API documentation for the Express app",
		},
		servers: [
			{
				url: "http://localhost:3000",
			},
		],
	};
	const routesOpenAPI = await loadPartialOpenAPI(path.join(__dirname, "../routes"));
	const swaggerSpec = deepmerge(baseOpenAPI, routesOpenAPI);
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
