/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import { describe } from "mocha";
import { expect } from "chai";
import Fastify from "fastify";
import request from "supertest";
import { authDatabase } from "src/configs/db.js";
import { setupFastifyTestEnv } from "src/setupFastify.js";
import {
	Email,
	ForgotPasswordPayload,
	organizations,
	users,
	VerifyEmailPayload,
} from "@adventurai/shared-types";
import { eq } from "drizzle-orm";
import { registerAndVerifyUser } from "../register/register.test.js";
let testUserId: string;

describe("Forgot Password Flow", function () {
	const fastify = Fastify({ logger: false });

	before(async function () {
		await setupFastifyTestEnv(fastify);
	});

	this.afterEach(async function () {
		await authDatabase.delete(users).where(eq(users.id, testUserId));
		await authDatabase
			.delete(organizations)
			.where(eq(organizations.ownerId, testUserId));
	});

	this.afterAll(async function () {
		await authDatabase.delete(users).where(eq(users.id, testUserId));
		await authDatabase
			.delete(organizations)
			.where(eq(organizations.ownerId, testUserId));
		await fastify.close();
	});

	it("should create a user and reset their password", async function () {
		const { user } = await registerAndVerifyUser(fastify);
		testUserId = user.id;
		const response = await request(fastify.server)
			.post("/api/v1/forgot-password")
			.send({ email: user.email as Email } satisfies ForgotPasswordPayload);
		expect(response.body.result.message).to.equal(
			"If that email address exists in our system, we have sent a password reset link to it.",
		);
		expect(response.body.result.message).to.be.a("string");
		const token = await authDatabase.query.userVerificationRequests
			.findFirst({
				where: (req, { eq }) => eq(req.userId, user.id),
			})
			.execute();
		expect(token).to.not.be.eq(undefined);
		const verifyResponse = await request(fastify.server)
			.get("/api/v1/verify")
			.query({
				token: token?.token as string,
				email: user.email as Email,
			} satisfies VerifyEmailPayload)
			.send();

		expect(verifyResponse.body.result.message).to.equal("Account verified");
	});
});
