/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get(
	"/entities/:entityId/roles",
	(req: Request<{ entityId: string }>, res: Response) => {
		res.send("Get roles for the entity with ID: " + req.params.entityId);
	},
);

export default router;
