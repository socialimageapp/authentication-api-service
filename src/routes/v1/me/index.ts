import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { withResult, UserSchema, User } from "@adventurai/shared-types";
import { authDatabase } from "src/configs/db.js";
import AppError from "src/utils/errors/AppError.js";

const MeResponseSchema = withResult(UserSchema.omit({ password: true }));

const meRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		// @ts-expect-error - preHandler is not defined in the Fastify type
		preHandler: [fastify.authenticate],
		schema: {
			summary: "Get User Details",
			description: "Returns user details of the authenticated user",
			tags: ["Users"],
			response: { 200: MeResponseSchema },
		},
		handler: async (request, reply) => {
			// @ts-expect-error - sub is not defined in the Fastify type
			const userId = request.user.sub!;

			const user = await authDatabase.query.users.findFirst({
				where: (usersTable, { eq }) => eq(usersTable.id, userId),
			});

			if (!user) {
				throw new AppError("User not found", 404, "");
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userWithoutPassword } = user;

			return reply.send({ result: userWithoutPassword as unknown as User });
		},
	});
};

export default meRoutes;
