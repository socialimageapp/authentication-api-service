/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import baseRouter from "src/api/baseRouter.js";

const router = baseRouter;

router.get("/oauth2/token", (req: Request, res: Response) => {
	res.send("Token exchange");
});

export default router;
