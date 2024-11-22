import { Request, Response } from "express";
import { Options } from "http-proxy-middleware";
// ----- Config Types -----

export enum Methods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
}

export interface Route {
  url: string;
  auth?: boolean;
  method: Methods;
  proxy: Options<Request, Response>;
}

export interface GatewayConfig {
  routes: Route[];
  cookieSessionOptions?: CookieSessionInterfaces.CookieSessionOptions;
}
