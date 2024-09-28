/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get("/forgot-password", (req: Request, res: Response) => {
	res.send("Returns user details of the authenticated user");
});

export default router;
