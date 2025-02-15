import {
	organizations,
	organizationUsers,
	organizationRoles,
	organizationKeys,
	organizationUserRoles,
    User,
} from "@adventurai/shared-types";
import { authDatabase } from "src/configs/db.js";

export interface CreateOrganizationOptions {
	name: string;
	description?: string;
	user: User;
}

/**
 * Creates a new organization and sets up all required related records
 */
export async function createOrganization(options: CreateOrganizationOptions) {
	const { name, description, user } = options;

	// Create the organization
	const [organization] = await authDatabase
		.insert(organizations)
		.values({
			ownerId: user.id,
			name,
			slug: crypto.randomUUID(),
			description: description || name,
		})
		.returning();

	// Create default organization roles
	const [ownerRole] = await authDatabase
		.insert(organizationRoles)
		.values({
			organizationId: organization.id,
			name: "Owner",
			description: "Full administrative access to the organization",
			permissions: {
				all: true,
			},
		})
		.returning();

	await authDatabase.insert(organizationRoles).values({
		organizationId: organization.id,
		name: "Member",
		description: "Standard member access to the organization",
		permissions: {
			read: true,
			write: true,
			delete: false,
			admin: false,
		},
	});

	// Create organization-user association
	const [orgUser] = await authDatabase
		.insert(organizationUsers)
		.values({
			organizationId: organization.id,
			userId: user.id,
		})
		.returning();

	// Assign owner role to user
	await authDatabase.insert(organizationUserRoles).values({
		organizationId: organization.id,
		userId: user.id,
		roleId: ownerRole.id,
	});

	// Create organization keys
	await authDatabase.insert(organizationKeys).values({
		organizationId: organization.id,
		privateKey: crypto.randomUUID(), // Note: Should use proper key generation in production
		publicKey: crypto.randomUUID(), // Note: Should use proper key generation in production
		algorithm: "RS256",
	});

	return { organization, orgUser, ownerRole };
}
