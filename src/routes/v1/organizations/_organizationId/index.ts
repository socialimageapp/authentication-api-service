/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	OrganizationIdSchema,
	OrganizationSchema,
	withResult,
	type OrganizationId,
} from "@adventurai/shared-types";

const ParamsSchema = z.object({ organizationId: OrganizationIdSchema });

const organizationRoutes: FastifyPluginAsyncZod = async function (fastify) {
	fastify.get("/", {
		schema: {
			summary: "Get Organization Details",
			description: "Returns organization details for the provided organization ID",
			tags: ["Organizations"],
			params: ParamsSchema,
			response: { 200: withResult(OrganizationSchema) },
		},
		handler: async (request, reply) => {
			const { organizationId } = request.params as {
				organizationId: OrganizationId;
			};
			return reply.send({
				result: {
					id: organizationId,
					name: "Organization Name",
					description: "Organization Description",
					colors: { primary: "#000000", secondary: "#FFFFFF" },
					createdAt: new Date(),
					updatedAt: new Date(),
					font: "Arial",
					identity: {
						logo: "https://example.com/logo.png",
						cover: "https://example.com/cover.png",
					},
					logos: {
						horizontal: "https://example.com/horizontal.png",
						vertical: "https://example.com/vertical.png",
						icon: "https://example.com/icon.png",
					},
					ownerId: "00000000-0000-0000-0000-000000000000",
					slug: "organization-slug",
					website: "https://example.com",
				},
			});
		},
	});
};

export default organizationRoutes;
