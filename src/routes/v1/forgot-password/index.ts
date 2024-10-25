import crypto from "crypto";
import { senders } from "src/utils/email";
import { authDatabase } from "src/configs/db";
import {
	ForgotPasswordPayloadSchema,
	ForgotPasswordResultSchema,
	userVerificationRequests,
	withResult,
} from "lib/ast/dist";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { emailQueue } from "src/queues";

const forgotPasswordRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.post("/", {
		schema: {
			body: ForgotPasswordPayloadSchema,
			response: { 200: withResult(ForgotPasswordResultSchema) },
		},
		handler: async (request, reply) => {
			const { email } = request.body;
			const user = await authDatabase.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
			});
			try {
				if (user) {
					const token = crypto.randomBytes(32).toString("hex");
					const expiresAt = new Date(Date.now() + 3600 * 1000);
					await authDatabase.insert(userVerificationRequests).values({
						userId: user.id,
						type: "password-reset",
						token,
						expiresAt,
					});
					const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&userId=${user.id}`;
					await emailQueue.add("sendEmail", {
						dynamicTemplateData: {
							name: `${user.firstName} ${user.lastName}`,
							resetLink,
						},
						email: email,
						sender: senders.contact,
						template: "resetPassword",
					});
				}
			} catch (error) {
				fastify.log.error(error);
			}
			return reply.send({
				result: {
					message:
						"If that email address exists in our system, we have sent a password reset link to it.",
				},
			});
		},
	});
};

export default forgotPasswordRoutes;
