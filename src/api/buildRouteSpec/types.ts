/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";


export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";
export type AuthType = "public" | "jwt";

export interface MethodSpec<TBody = any, TQuery = any> {
  handler: RequestHandler<{}, any, TBody, TQuery>;
  auth?: AuthType;
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
}

export interface RouteSpec {
  path: string;
  methods: {
    [method in HttpMethod]?: MethodSpec<any, any>;
  };
}