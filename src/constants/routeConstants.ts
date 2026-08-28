export const APP_ROUTES = {
  DASHBOARD: "/",
  CALENDAR: "/calendar",
  VENUES: "/venues",
  EVENTS: "/events",
  PERSONNEL: "/personnel",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
