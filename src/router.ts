import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { APP_ROUTES } from "./constants/routeConstants";

const rootRoute = createRootRoute({});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.DASHBOARD,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.CALENDAR,
});

const venuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.VENUES,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.EVENTS,
});

const personnelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.PERSONNEL,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.REPORTS,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: APP_ROUTES.SETTINGS,
});

export const routeTree = rootRoute.addChildren([
  dashboardRoute,
  calendarRoute,
  venuesRoute,
  eventsRoute,
  personnelRoute,
  reportsRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
