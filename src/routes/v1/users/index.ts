/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */

import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get("/users", (req: Request, res: Response) => {
	res.json({ result: [] }).send();
});

export default router;
