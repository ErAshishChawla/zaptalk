import { Express, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { NotFoundError, requireAuth } from "@eraczaptalk/zaptalk-common";

import { config } from "../config/config";
import { on } from "winston-daily-rotate-file";

const { routes } = config;

export const setupRoutes = (app: Express) => {
  routes.forEach((route) => {
    app.use(
      route.url,
      (req, res, next) => {
        if (req.method.toLowerCase() !== route.method) {
          throw new NotFoundError();
        }
        next();
      },
      (req, res, next) => {
        if (route.auth) {
          requireAuth(req, res, next);
        } else {
          next();
        }
      },
      createProxyMiddleware({
        target: route.proxy.target,
        changeOrigin: route.proxy.changeOrigin,
        pathRewrite: route.proxy.pathRewrite,
      })
    );
  });
};

// export const setupAuth = (app: Express) => {
//   routes.forEach((route) => {
//     if (route.auth) {
//       if (route.url && Array.isArray(route.url)) {
//         route.url.forEach((url) => {
//           app.use(
//             url,
//             requireAuth,
//             function (req: Request, res: Response, next: NextFunction) {
//               next();
//             }
//           );
//         });
//       } else {
//         app.use(
//           route.url,
//           requireAuth,
//           function (req: Request, res: Response, next: NextFunction) {
//             next();
//           }
//         );
//       }
//     }
//   });
// };

// export const setupRateLimit = (app: Express) => {
//   routes.forEach((route) => {
//     if (route.rateLimit) {
//       if (route.url && Array.isArray(route.url)) {
//         route.url.forEach((url) => {
//           app.use(url, rateLimit(route.rateLimit));
//         });
//       } else {
//         app.use(route.url, rateLimit(route.rateLimit));
//       }
//     }
//   });
// };
