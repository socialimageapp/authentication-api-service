/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import type { Router } from "express";
import { jwtAuthMiddleware } from "./middlewares/authMiddleware.js";
import { validateBody, validateQuery } from "./middlewares/validationMiddleware.js";
import type { RouteSpec, MethodSpec, HttpMethod } from "./types.js";

export function buildRouteSpecs(router: Router, routeSpecs: RouteSpec[]) {
  routeSpecs.forEach((routeSpec) => {
    const { path, methods } = routeSpec;

    Object.entries(methods).forEach(([method, spec]) => {
      const methodLower = method.toLowerCase() as HttpMethod;
      const middlewares = [];

      // Type assertion for MethodSpec
      const methodSpec = spec as MethodSpec;

      // Authentication middleware
      if (methodSpec.auth === "jwt") {
        middlewares.push(jwtAuthMiddleware);
      }

      // Validation middlewares
      if (methodSpec.bodySchema) {
        middlewares.push(validateBody(methodSpec.bodySchema));
      }

      if (methodSpec.querySchema) {
        middlewares.push(validateQuery(methodSpec.querySchema));
      }

      // Add the route to the router
      (router as any)[methodLower](
        path,
        ...middlewares,
        methodSpec.handler
      );
    });
  });
}