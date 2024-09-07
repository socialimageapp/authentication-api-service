/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { BrandId } from "@adventurai/shared-types";
import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get(
	"/organizations/:organizationId",
	(req: Request<{ organizationId: BrandId }>, res: Response) => {
		const { organizationId } = req.params;
		res.send().json({ organizationId });
	},
);

export default router;
