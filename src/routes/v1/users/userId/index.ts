/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { UserId } from "@adventurai/shared-types";
import type { Request, Response } from "express";
import router from "src/api/baseRouter.js";

router.get("/users/:userId", (req: Request<{ userId: UserId }>, res: Response) => {
	const { userId } = req.params;
	res.send(`Details of user with ID: ${userId}`);
});

export default router;
