/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

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

const config: ApiConfig = {
	business: {
		email: "contact@adventur.ai",
		name: "AdVentur.ai",
		website: "https://adventur.ai",
		logo: {
			horizontal:
				"https://res.cloudinary.com/social-image-app/image/upload/v1729945562/logo_g3dmcl.png",
		},
	},
	docsPath: "/docs",
	version: "1.0.0",
	allowedOrigins: [
		process.env.FRONTEND_URL ?? "http://localhost:3000",
		"https://127.0.0.1:3000",
		"https://localhost:3000",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"https://app.adventur.ai",
		"https://develop.app.adventur.ai",
	],
	basePath: { v1: "/api/auth/v1" },
	description:
		"AdVentur.ai Auth Service API. This service is responsible for managing user authentication and authorization.",
	appName: "AdVentur.ai",
} as const;

export default config;
