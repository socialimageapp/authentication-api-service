/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { UserSchema, type User as UserType } from "@adventurai/shared-types";
import type { Item } from "dynamoose/dist/Item.js";
import baseRouter from "src/api/baseRouter.js";
import { buildRouteSpecs } from "src/api/buildRouteSpec/buildRouteSpec.js";
import dynamoose from "src/configs/db.js";
import { z } from "zod";

const verifySchema = z.object({ token: z.string() });
interface User extends UserType, Item {}

const convertZodSchemaToDynamooseSchema = <T extends z.ZodRawShape>(
	zodSchema: z.ZodObject<T>,
) => {
	const dynamooseSchema: Record<string, any> = {};

	Object.entries(zodSchema.shape).forEach(([key, value]) => {
		const fieldType = value._def.typeName;
		let dynamoType;

		switch (fieldType) {
			case "ZodString":
				dynamoType = String;
				break;
			case "ZodNumber":
				dynamoType = Number;
				break;
			case "ZodBoolean":
				dynamoType = Boolean;
				break;
			case "ZodEnum":
				dynamoType = value._def.values;
				break;
			case "ZodOptional":
				dynamoType = value._def.innerType._def.typeName;
				break;
			case "ZodBranded":
				dynamoType = String;
				break;
			case "ZodDate":
				dynamoType = Date;
				break;
			// Add more cases as necessary for other Zod types
			default:
				throw new Error(`Unsupported Zod type: ${fieldType}`);
		}

		dynamooseSchema[key] = {
			type: dynamoType,
			required: value.isOptional() ? false : true,
		};
	});
	console.log(dynamooseSchema);
	return new dynamoose.Schema(dynamooseSchema);
};

const schemaUpdated = convertZodSchemaToDynamooseSchema(UserSchema);
console.log(schemaUpdated);

const UserDynamoose = dynamoose.model<User>("User", schemaUpdated);

const setupUserAccount = async (user: User) => {
	// Run any setup tasks for the user account here
};

buildRouteSpecs(baseRouter, [
	{
		path: "/verify",
		methods: {
			get: {
				auth: "public",
				querySchema: verifySchema,
				handler: async ({ query }, res) => {
					const { token } = query;
					const users = await UserDynamoose.scan("verificationToken")
						.eq(token)
						.exec();
					if (users.length === 0) {
						return res
							.status(400)
							.json({ error: "Invalid or expired verification token" });
					}
					const user = users[0];
					// Update user as verified
					user.isVerified = true;
					user.verificationToken = undefined;
					await user.save();

					// Run setup function now that the account is verified
					try {
						await setupUserAccount(user);
					} catch (error) {
						console.error(
							`Error setting up account for user ${user.email}:`,
							error,
						);
						return res.status(500).json({
							error: "An error occurred during account setup.",
						});
					}

					res.json({ message: "Account verified and setup successfully" });
				},
			},
		},
	},
]);

export default baseRouter;
