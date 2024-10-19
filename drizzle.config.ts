/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: `./.config/environments/.env.${process.env.MODE ?? "local"}` });

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url: process.env.AUTH_DATABASE_URL! },
});
