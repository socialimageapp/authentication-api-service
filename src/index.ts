/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import express from "express";
import path from "path";
import { readdir, stat } from "fs/promises";
import { fileURLToPath, pathToFileURL } from "url";
import setupSwagger from "./api/swagger.js";
import { AppError } from "./api/baseRouter.js";
import config from "./api/config.js";

const app = express();

setupSwagger(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadRoutes = async (dirPath: string) => {
	const files = await readdir(dirPath);
	for (const file of files) {
		const fullPath = path.join(dirPath, file);
		const pathDetails = await stat(fullPath);
		if (pathDetails.isDirectory()) {
			await loadRoutes(fullPath);
		} else if (file === "index.ts" || file === "index.js") {
			const fileUrl = pathToFileURL(fullPath).href;
			const { default: router } = await import(fileUrl);
			app.use(config.basePath.v1, router);
		}
	}
};
const routesDir = path.join(__dirname, "routes");
await loadRoutes(routesDir);

const PORT = process.env.PORT || 3000;

app.use((req) => {
	throw new AppError(`Cannot find ${req.originalUrl} on this server!`, 404);
});

app.listen(PORT, () => {
	//eslint-disable-next-line no-console
	console.log(`Server is running on port ${PORT}`);
});
