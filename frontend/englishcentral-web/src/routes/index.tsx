import { createBrowserRouter }
from "react-router-dom";

import { adminRoutes }
from "./admin.routes";

import { publicRoutes }
from "./public.routes";

export const router =
  createBrowserRouter([
    ...adminRoutes,
    ...publicRoutes,
  ]);