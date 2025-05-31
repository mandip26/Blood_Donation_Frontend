import { lazyRouteComponent } from "@tanstack/react-router";

export const Component = lazyRouteComponent(
  () => import("./_dashboardLayout/create.lazy")
);
