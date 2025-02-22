import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { authSchema, billingSchema, generateSchema } from "@adventurai/shared-types";

export { authSchema, billingSchema, generateSchema };

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
const billingConnectionPool = new pg.Pool({
	connectionString: process.env.BILLING_DATABASE_URL!,
});
const generateConnectionPool = new pg.Pool({
	connectionString: process.env.GENERATE_DATABASE_URL!,
});
export const authDatabase = drizzle(authConnectionPool, {
	schema: authSchema,
	casing: "snake_case",
});

export const billingDatabase = drizzle(billingConnectionPool, {
	schema: billingSchema,
	casing: "snake_case",
});


export const generateDatabase = drizzle(generateConnectionPool, {
	schema: generateSchema,
	casing: "snake_case",
});

