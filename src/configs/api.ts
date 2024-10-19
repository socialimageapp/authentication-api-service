/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

interface ApiConfig {
	basePath: { v1: string };
	description?: string;
	appName?: string;
	version?: string;
	docsPath?: string;
}

const config: ApiConfig = {
	docsPath: "/docs",
	version: "1.0.0",
	basePath: { v1: "/api/auth/v1" },
	description:
		"AdVentur.ai Auth Service API. This service is responsible for managing user authentication and authorization.",
	appName: "AdVentur.ai",
} as const;

export default config;
