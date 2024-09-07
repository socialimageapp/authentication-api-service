/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import express from "express";
import path from "path";
import { readdir, stat } from "fs/promises";
import { fileURLToPath, pathToFileURL } from "url";
import { AppError } from "./api/baseRouter.js";
import config from "./api/config.js";
import setupSwaggerForVersion from "./api/swagger.js";
import dotenv from "dotenv";
import favicon from "serve-favicon";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
	path: path.join(
		__dirname,
		`../.config/environments/.env.${process.env.ENV ?? "local"}`,
	),
});

const PORT = process.env.PORT || 3000;

const app = express();
const faviconPath = path.join(__dirname, "../public", "favicon.ico");

app.use(favicon(faviconPath));
setupSwaggerForVersion(app, "v1", [`http://localhost:${PORT}${config.basePath.v1}`]);

const loadRoutes = async (dirPath: string) => {
	const files = await readdir(dirPath);
	for (const file of files) {
		const fullPath = path.join(dirPath, file);
		const pathDetails = await stat(fullPath);
		if (pathDetails.isDirectory()) {
			await loadRoutes(fullPath);
		} else if (file === "index.ts" || file === "index.js") {
			//eslint-disable-next-line no-console
			console.log("Loading routes from", fullPath);
			const fileUrl = pathToFileURL(fullPath).href;
			const { default: router } = await import(fileUrl);
			app.use(config.basePath.v1, router);
		}
	}
};
const routesDir = path.join(__dirname, "routes");
await loadRoutes(routesDir);

app.use((req) => {
	throw new AppError(`Cannot find ${req.originalUrl} on this server!`, 404);
});

app.listen(PORT, () => {
	//eslint-disable-next-line no-console
	console.log(`Server is running on port ${PORT}`);
});
