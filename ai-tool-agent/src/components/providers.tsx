"use client";

import { DashboardProvider } from "@/context/dashboard-context";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardProvider>{children}</DashboardProvider>
);
