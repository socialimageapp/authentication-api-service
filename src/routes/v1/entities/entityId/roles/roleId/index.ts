/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { RoleId } from "@adventurai/shared-types";
import type { Request, Response } from "express";
import baseRouter from "src/api/baseRouter.js";

const router = baseRouter;

router.get(
	"/entities/:entityId/roles/:roleId",
	(req: Request<{ roleId: RoleId }>, res: Response) => {
		res.send("Get entity role by ID");
	},
);

export default router;
