import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { authSchema } from "@adventurai/shared-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(
	__dirname,
	`../../.config/environments/.env.${process.env.ENV ?? "local"}`,
);
dotenv.config({ path: envPath });

const authConnectionPool = new pg.Pool({
	connectionString: process.env.AUTH_DATABASE_URL!,
});
export const authDatabase = drizzle(authConnectionPool, {
	schema: authSchema,
	casing: "snake_case",
});
