"use client";

import type { PropsWithChildren } from "react";
import AppQueryClientProvider from "./query-client-provider";
import { RouteProvider } from "./router-provider";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface AppProviderProps extends PropsWithChildren {
  session?: Session | null;
}

export const AppProvider = ({ children, session }: AppProviderProps) => {
  return (
    <SessionProvider session={session}>
      <AppQueryClientProvider>
        <RouteProvider>{children}</RouteProvider>
      </AppQueryClientProvider>
    </SessionProvider>
  );
};
