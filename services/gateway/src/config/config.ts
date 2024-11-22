import { GatewayConfig, Methods } from "../types";

const config: GatewayConfig = {
  cookieSessionOptions: {
    signed: false,
    secure: true,
    name: "zaptalk-session",
  },
  routes: [
    {
      url: "/api/auth/signup",
      method: Methods.POST,
      auth: false,
      proxy: {
        target: "http://auth-srv:3000",
        changeOrigin: true,
        pathRewrite: function (path, req) {
          return req.originalUrl.replace("/api/auth", "");
        },
      },
    },
    {
      url: "/api/auth/health",
      method: Methods.GET,
      auth: false,
      proxy: {
        target: "http://auth-srv:3000",
        changeOrigin: true,
        pathRewrite: function (path, req) {
          return req.originalUrl.replace("/api/auth", "");
        },
      },
    },
  ],
};

export { config };
