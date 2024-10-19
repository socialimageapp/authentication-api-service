/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	OrganizationUserIdSchema,
	OrganizationUserRoleSchema,
	withResult,
} from "@adventurai/shared-types";

const ParamsSchema = z.object({
	userId: OrganizationUserIdSchema,
});

const userRolesRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get Organization Roles",
			description: "Returns custom organization roles",
			tags: ["Organization Roles"],
			params: ParamsSchema,
			response: { 200: withResult(z.array(OrganizationUserRoleSchema)) },
		},
		handler: async (request, reply) => {
			// const { userId } = request.params;
			// Logic to retrieve roles of the user based on userId
			return reply.send({
				result: [],
			});
		},
	});
};

export default userRolesRoutes;
