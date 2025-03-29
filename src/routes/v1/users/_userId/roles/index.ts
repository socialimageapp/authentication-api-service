

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { RoleSchema, withResult } from "@adventurai/shared-types";

const UserRolesParamsSchema = z.object({
	userId: z.string().uuid(),
});

const userRolesRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User Roles",
			description:
				"Returns roles for the current authenticated user (Not organization roles)",
			tags: ["Roles"],
			params: UserRolesParamsSchema,
			response: { 200: withResult(z.array(RoleSchema)) },
		},
		handler: async (request, reply) => {
			// const { userId } = request.params;
			// Logic to retrieve roles for the user with the provided userId
			return reply.send({ result: [] });
		},
	});
};

export default userRolesRoutes;
