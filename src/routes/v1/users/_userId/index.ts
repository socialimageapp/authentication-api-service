/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { User, UserIdSchema, UserSchema, withResult } from "@adventurai/shared-types";
import { authDatabase } from "src/configs/db";
import AppError from "src/utils/errors/AppError";

const UserParamsSchema = z.object({ userId: UserIdSchema });

const userRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User",
			description: "Returns details of the user with the provided userId",
			tags: ["Users"],
			params: UserParamsSchema,
			response: { 200: withResult(UserSchema.omit({ password: true })) },
		},
		handler: async (request, reply) => {
			const { userId } = request.params;
			const user = (await authDatabase.query.users
				.findFirst({ where: (users, { eq }) => eq(users.id, userId) })
				.execute()) as User | null;
			if (!user) {
				throw new AppError("User not found", 404, "");
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...result } = user;
			reply.send({ result });
		},
	});
};

export default userRoutes;
