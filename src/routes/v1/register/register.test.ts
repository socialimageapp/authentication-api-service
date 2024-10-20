/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import { describe } from "mocha";
import { expect } from "chai";
import { FastifyInstance } from "fastify";
import request from "supertest";
import { authDatabase } from "src/configs/db";
import { v4 as uuidv4 } from "uuid";
import { setupFastify } from "src/tests/setupFastify";
import { organizations, users } from "lib/ast/dist";
import { eq } from "drizzle-orm";
// import { exec } from "child_process";
// import util from "util";
// const execPromise = util.promisify(exec);
let testUserId: string;
let testVerificationToken: string;

export const registerUser = async (
	fastify: FastifyInstance,
): Promise<{
	response: request.Response;
	registerPayload: {
		email: string;
		password: string;
		confirmPassword: string;
		firstName: string;
		lastName: string;
	};
}> => {
	const email = `${uuidv4()}@example.com`;
	const password = "ThisIsAPassword123!";
	const firstName = "John";
	const lastName = "Doe";

	const registerPayload = {
		email,
		password,
		confirmPassword: password,
		firstName,
		lastName,
	};

	const registerResponse = await request(fastify.server)
		.post("/api/v1/register") // Adjust the path to include the prefix
		.send(registerPayload);
	return {
		response: registerResponse,
		registerPayload,
	};
};

describe("Registration and Verification Flow", function () {
	let fastify: FastifyInstance;

	before(async function () {
		fastify = await setupFastify();
	});

	this.afterAll(async function () {
		await authDatabase.delete(users).where(eq(users.id, testUserId));
		await authDatabase
			.delete(organizations)
			.where(eq(organizations.ownerId, testUserId));
		await authDatabase.$client.end();
		await fastify.close();
	});

	it("should register a new user and create a verification request", async function () {
		const { registerPayload, response: registerResponse } =
			await registerUser(fastify);
		expect(registerResponse.body.result.message).to.equal(
			"Registration successful. Please verify your email.",
		);
		const { email } = registerPayload;
		const userId = registerResponse.body.result.userId;
		// Verify that the user exists in the database
		const user = await authDatabase.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email),
		});
		expect(user).to.not.be.eq(undefined);
		expect(user?.verified).to.be.eq(false);

		// Check the user verification request exists
		const verificationRequest =
			await authDatabase.query.userVerificationRequests.findFirst({
				where: (userVerificationRequests, { eq }) =>
					eq(userVerificationRequests.userId, userId),
			});
		if (!verificationRequest) {
			throw new Error("No verification request found for the user");
		}
		expect(verificationRequest.token).to.not.be.eq(undefined);

		testUserId = userId;
		testVerificationToken = verificationRequest.token;
	});

	it("should verify the user using the verification token", async function () {
		const verifyResponse = await request(fastify.server)
			.get("/api/v1/verify") // Adjust the path to include the prefix
			.query({ token: testVerificationToken, userId: testUserId })
			.expect(200);

		expect(verifyResponse.body.message).to.equal("Account verified");

		// Verify the user is now marked as verified in the database
		const verifiedUser = await authDatabase.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, testUserId),
		});
		expect(verifiedUser).to.not.be.eq(undefined);
		expect(verifiedUser?.verified).to.be.eq(true);

		// Check that the verification request has been deleted
		const deletedVerificationRequest =
			await authDatabase.query.userVerificationRequests.findFirst({
				where: (userVerificationRequests, { eq }) =>
					eq(userVerificationRequests.userId, testUserId),
			});
		expect(deletedVerificationRequest).to.be.eq(undefined);
	});
	// it("should connect and return a query result", async () => {
	// 	const container = await new PostgreSqlContainer().withDatabase("auth").start();
	// 	const databaseUrl = container.getConnectionUri();
	// 	await execPromise(
	// 		`npx drizzle-kit push dialect=postgresql schema=src/schema.ts url=${databaseUrl}`,
	// 	);
	// 	process.env.AUTH_DATABASE_URL = databaseUrl;
	// 	await container.stop();
	// }).timeout(60000);
});
