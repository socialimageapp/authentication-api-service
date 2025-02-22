import {
	organizations,
	organizationUsers,
	organizationRoles,
	organizationKeys,
	organizationUserRoles,
	User,
	subscriptions,
	Subscription,
	plans,
	corePlan,
	Organization,
	OrganizationId,
	Timestamp,
	subscriptionUsages,
} from "@adventurai/shared-types";
import { authDatabase, billingDatabase } from "src/configs/db.js";

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

	const trialDuration = 30;


	const subscription = await billingDatabase.insert(subscriptions).values({
		organizationId: organization.id as OrganizationId,
		planId:corePlan.id,
		status: "active",
		currency: "USD",
		price: 0,
		cancellationEffectiveDate: null,
		cancelUrl: null,
		nextBillDate: null,
		updateUrl: null,
		startDate: new Date(),
		subscriptionUsageId: "2",
		period:"month",
		trial: {
			startDate: new Date(),
			endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * trialDuration),
		},
		endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * trialDuration),
	} satisfies Omit<Subscription, "id" | "createdAt" | "updatedAt">).returning();

	const subscriptionId = subscription[0].id;
	if (!subscriptionId) {
		throw new Error("Failed to create subscription");
	}


	const subscriptionUsage = await billingDatabase.insert(subscriptionUsages).values({
		subscriptionId: subscriptionId,
		credits: 0,
		resetDate: Date.now() as Timestamp,
	}).returning();

	return { organization, orgUser, ownerRole };
}
