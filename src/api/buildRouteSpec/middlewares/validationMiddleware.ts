/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";


export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      res.status(400).json({ errors: err.errors });
    }
  };
}

export function validateQuery(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err: any) {
      res.status(400).json({ errors: err.errors });
    }
  };
}