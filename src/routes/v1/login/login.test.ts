/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import { describe } from "mocha";
import { expect } from "chai";
import Fastify from "fastify";
import request from "supertest";
import { authDatabase } from "src/configs/db.js";
import { setupFastifyTestEnv } from "src/setupFastify.js";
import { Email, LoginPostPayload, organizations, users } from "@adventurai/shared-types";
import { eq } from "drizzle-orm";
import { registerAndVerifyUser } from "../register/register.test.js";
import { randomUUID } from "crypto";
let testUserId: string;

describe("Login Flow", function () {
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

	it("should login successfully", async function () {
		const { user, password } = await registerAndVerifyUser(fastify);
		testUserId = user.id;
		const loginResponse = await request(fastify.server)
			.post("/api/v1/login")
			.send({ email: user.email as Email, password } satisfies LoginPostPayload);
		expect(loginResponse.body.result.message).to.equal("Login successful");
		expect(loginResponse.body.result.token).to.be.a("string");
		const meResponse = await request(fastify.server)
			.get("/api/v1/me")
			.set("Authorization", `Bearer ${loginResponse.body.result.token}`);
		expect(meResponse.body.result.email).to.equal(user.email);
	});
	it("should login successfully", async function () {
		const { user, password } = await registerAndVerifyUser(fastify);
		testUserId = user.id;
		await request(fastify.server)
			.post("/api/v1/login")
			.send({ email: user.email as Email, password } satisfies LoginPostPayload);
		await request(fastify.server)
			.get("/api/v1/me")
			.set("Authorization", `Bearer ${randomUUID()}`)
			.expect(401);
	});
});
