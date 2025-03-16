type BusinessConfig = {
	name: string;
	website: string;
	email: string;
	logo: {
		horizontal: string;
	};
};
interface ApiConfig {
	basePath: { v1: string };
	description?: string;
	appName?: string;
	version?: string;
	allowedOrigins: string[];
	docsPath?: string;
	business: BusinessConfig;
}

export const environments = ["local", "staging", "production"] as const;
export type Environment = (typeof environments)[number];

const apiBasePath = "/api/auth/v1";

const config = {
	business: {
		email: "contact@adventur.ai",
		name: "AdVentur.ai",
		website: "https://adventur.ai",
		logo: {
			horizontal:
				"https://res.cloudinary.com/social-image-app/image/upload/v1729945562/logo_g3dmcl.png",
		},
	},
	docsPath: `${apiBasePath}/docs`,
	version: "1.0.0",
	allowedOrigins: [
		process.env.FRONTEND_URL ?? "http://localhost:3000",
		"https://127.0.0.1:3000",
		"https://localhost:3000",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"https://app.adventur.ai",
		"https://staging.app.adventur.ai",
	],
	basePath: { v1: apiBasePath },
	description:
		"AdVentur.ai Auth Service API. This service is responsible for managing user authentication and authorization.",
	appName: "AdVentur.ai",
} as const satisfies ApiConfig;

export default config;
