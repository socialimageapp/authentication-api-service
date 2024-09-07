/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { UserId } from "@adventurai/shared-types";
import type { Request, Response } from "express";
import baseRouter from "src/api/baseRouter.js";

const router = baseRouter;

router.get("/users/:userId/roles", (req: Request<{ userId: UserId }>, res: Response) => {
	const { userId } = req.params;
	res.send(`Roles of user with ID: ${userId}`);
});

export default router;
