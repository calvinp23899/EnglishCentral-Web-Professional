import { createBrowserRouter } from "react-router-dom";

import { publicRoutes } from "./public.routes";
import { adminRoutes } from "./admin.routes";

export const router = createBrowserRouter([
  publicRoutes,
  ...adminRoutes,
]);