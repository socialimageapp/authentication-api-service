/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { builtInRoles, RoleSchema, withResult } from "lib/ast/dist";
import { z } from "zod";

const rolesRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Roles",
			description: "Returns built-in application roles",
			tags: ["Roles"],
			response: { 200: withResult(z.array(RoleSchema)) },
		},
		handler: async (request, reply) => {
			return reply.send({ result: [...builtInRoles] });
		},
	});
};

export default rolesRoutes;
