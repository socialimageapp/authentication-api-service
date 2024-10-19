/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UserSchema, withResult } from "lib/ast/dist";
import { z } from "zod";

const usersRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			hide: true,
			summary: "Get Users",
			description: "Returns a list of users",
			tags: ["Users"],
			response: { 200: withResult(z.array(UserSchema)) },
		},
		handler: async (request, reply) => {
			return reply.send({ result: [] });
		},
	});
};

export default usersRoutes;
