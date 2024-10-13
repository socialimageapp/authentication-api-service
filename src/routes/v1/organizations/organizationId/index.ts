/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { OrganizationId } from "@adventurai/shared-types";
import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get(
	"/organizations/:organizationId",
	(req: Request<{ organizationId: OrganizationId }>, res: Response) => {
		const { organizationId } = req.params;
		res.send().json({ organizationId });
	},
);

export default router;
