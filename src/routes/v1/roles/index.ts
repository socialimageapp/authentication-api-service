/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get("/roles", (req: Request, res: Response) => {
	res.send("List of Roles for the current authenticated user");
});

export default router;
