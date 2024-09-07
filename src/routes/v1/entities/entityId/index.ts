/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get("/entities/:entityId", (req: Request<{ entityId: string }>, res: Response) => {
	res.send("Get entity by ID");
});

export default router;
