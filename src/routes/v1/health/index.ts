import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { withResult } from "@adventurai/shared-types";
const healthRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Health Check",
			description: "Returns 200 if the service is healthy",
			tags: ["Health"],
			response: { 200: withResult(z.object({ status: z.string() })) },
		},
		handler: async (request, reply) => {	
			return reply.send({ result: { status: "ok" } });
		},
	});
};

export default healthRoutes;
