/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

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
					result: LoginResultSchema,
				},
				handler: async ({ query }, res) => {
					res.json({ message: "Account verified and setup successfully" });
				},
			},
		},
	},
]);

export default router;
