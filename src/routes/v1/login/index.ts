/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import {
	LoginPostPayloadSchema,
	LoginSuccessResultSchema,
} from "@adventurai/shared-types";
import router from "src/api/baseRouter.js";
import { buildRouteSpecs } from "src/api/buildRouteSpec/buildRouteSpec.js";

buildRouteSpecs(router, [
	{
		path: "/login",
		methods: {
			get: {
				auth: "public",
				schema: {
					body: LoginPostPayloadSchema,
					result: LoginSuccessResultSchema,
				},
				handler: async ({ query }, res) => {
					return {
						message: "Hello, world!",
					};
				},
			},
		},
	},
]);

export default router;
