import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const healthRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Health Check",
			description: "Returns 200 if the service is healthy",
			tags: ["Health"],
			response: { 200: { type: "object", properties: { status: { type: "string" } } } },
		},
		handler: async (request, reply) => {
			return reply.send({ status: "ok" });
		},
	});
};

export default healthRoutes;
