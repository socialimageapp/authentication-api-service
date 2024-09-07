/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

interface ApiConfig {
	basePath: {
		v1: string;
	};
}

const config: ApiConfig = {
	basePath: {
		v1: "/api/authentication/v1",
	},
};
export default config;
