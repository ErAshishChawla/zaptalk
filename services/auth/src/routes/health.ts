import { Router } from "express";
import { routeMap } from "../utils/routeMap";
import { apiResponse } from "@eraczaptalk/zaptalk-common";

export const router = Router();

router.get(routeMap.health(), (req, res) => {
  res.status(200).send(apiResponse({ statusCode: 200 }));
});

export { router as healthRouter };
