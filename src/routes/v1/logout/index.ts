

import { withResult } from "@adventurai/shared-types";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const logoutRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Logout of the application",
			description: "Logout of the application and clear the session",
			tags: ["Authentication"],
			response: {
				200: withResult(z.object({ message: z.string() })),
			},
		},
		handler: async (request, reply) => {
			reply.clearCookie("accessToken", { path: "/" });
			return reply.send({
				result: { message: "You have been logged out successfully" },
			});
		},
	});
};

export default logoutRoutes;
