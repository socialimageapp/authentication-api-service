/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserSchema, withResult } from "@adventurai/shared-types";

const UserParamsSchema = z.object({
	userId: z.string().uuid(), // Assuming UserId is a UUID, adjust if necessary
});

const userRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get User",
			description: "Returns details of the user with the provided userId",
			tags: ["Users"],
			params: UserParamsSchema,
			response: { 200: withResult(UserSchema) },
		},
		handler: async (request, reply) => {
			const { userId } = request.params;

			// Logic to retrieve details for the user with the provided userId
			return reply.send({
				result: {
					createdAt: new Date(),
					email: "test@gmail.com",
					id: userId,
					enrolled: false,
					firstName: "John",
					lastName: "Doe",
					lastLogin: new Date(),
					password: "password",
					phoneNumber: "1234567890",
					profileImageUrl: "https://example.com/image.jpg",
					updatedAt: new Date(),
					username: "johndoe",
					userType: "user",
					verification: {
						verificationCode: "",
						verified: false,
					},
				},
			});
		},
	});
};

export default userRoutes;
