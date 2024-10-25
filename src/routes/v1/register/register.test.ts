/**
 * Updated test for Registration and Verification Flow using Fastify providers and plugins
 */
import { describe } from "mocha";
import { expect } from "chai";
import Fastify, { FastifyInstance } from "fastify";
import request from "supertest";
import { authDatabase } from "src/configs/db";
import { v4 as uuidv4 } from "uuid";
import { setupFastifyTestEnv } from "src/setupFastify";
import {
	Email,
	organizations,
	Password,
	RegisterPostPayload,
	User,
	users,
	UserVerificationRequest,
} from "@adventurai/shared-types";
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
	verificationRequest: UserVerificationRequest;
	registerPayload: RegisterPostPayload;
}> => {
	const email = `${uuidv4()}-awesomeapp@example.com`;
	const password = "ThisIsAPassword123!";
	const firstName = "Elon";
	const lastName = "Musk";

	const registerPayload: RegisterPostPayload = {
		email: email as Email,
		password: password as Password,
		confirmPassword: password as Password,
		firstName,
		lastName,
	};

	const registerResponse = await request(fastify.server)
		.post("/api/v1/register")
		.send(registerPayload)
		.expect(200);

	const userId = registerResponse.body.result.userId;

	const verificationRequest =
		(await authDatabase.query.userVerificationRequests.findFirst({
			where: (userVerificationRequests, { eq }) =>
				eq(userVerificationRequests.userId, userId),
		})) as UserVerificationRequest | undefined;
	if (!verificationRequest) {
		throw new Error("No verification request found for the user");
	}
	expect(verificationRequest.token).to.not.be.eq(undefined);

	const user = await authDatabase.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email),
	});
	expect(user).to.not.be.eq(undefined);
	expect(user?.verified).to.be.eq(false);
	return { response: registerResponse, registerPayload, verificationRequest };
};

export const verifyUser = async (
	fastify: FastifyInstance,
	token: string,
	userId: string,
): Promise<request.Response> => {
	return request(fastify.server)
		.get("/api/v1/verify")
		.query({ token, userId })
		.expect(200);
};

export const registerAndVerifyUser = async (
	fastify: FastifyInstance,
): Promise<{ user: User; password: Password }> => {
	const {
		response: registerResponse,
		verificationRequest,
		registerPayload,
	} = await registerUser(fastify);
	const userId = registerResponse.body.result.userId;
	const verificationToken = verificationRequest.token;
	await verifyUser(fastify, verificationToken, userId);
	const user = (await authDatabase.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
	})) as User | undefined;
	if (!user) {
		throw new Error("User not found");
	}
	const password = registerPayload.password;
	return { user, password };
};

describe("Registration and Verification Flow", function () {
	const fastify = Fastify({ logger: false });

	before(async function () {
		await setupFastifyTestEnv(fastify);
	});

	this.afterAll(async function () {
		await authDatabase.delete(users).where(eq(users.id, testUserId));
		await authDatabase
			.delete(organizations)
			.where(eq(organizations.ownerId, testUserId));
		await fastify.close();
	});

	it("should register a new user and create a verification request", async function () {
		const { response: registerResponse, verificationRequest } =
			await registerUser(fastify);
		expect(registerResponse.body.result.message).to.equal(
			"Registration successful. Please verify your email.",
		);
		const userId = registerResponse.body.result.userId;
		testUserId = userId;
		testVerificationToken = verificationRequest.token;
	});

	it("should verify the user using the verification token", async function () {
		const verifyResponse = await verifyUser(
			fastify,
			testVerificationToken,
			testUserId,
		);
		expect(verifyResponse.body.result.message).to.equal("Account verified");

		const verifiedUser = await authDatabase.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, testUserId),
		});
		expect(verifiedUser).to.not.be.eq(undefined);
		expect(verifiedUser?.verified).to.be.eq(true);

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
