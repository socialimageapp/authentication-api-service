/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PermissionSchema, withResult } from "@adventurai/shared-types";

const PermissionsParamsSchema = z.object({
	userId: z.string().uuid(),
});

const permissionsRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/permissions", {
		schema: {
			params: PermissionsParamsSchema,
			response: { 200: withResult(z.array(PermissionSchema)) },
		},
		handler: async (request, reply) => {
			// const { userId } = request.params;

			// Logic to retrieve permissions for the user with the provided userId
			return reply.send({
				result: [{ description: "Can view user details", name: "view_user" }],
			});
		},
	});
};

export default permissionsRoutes;
