"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type RouteCoords = {
  from: [number, number];
  to: [number, number];
};

interface PackageRouteContextValue {
  route: RouteCoords | null;
  setRoute: (from: [number, number], to: [number, number]) => void;
  clearRoute: () => void;
}

const PackageRouteContext = createContext<PackageRouteContextValue | null>(null);

export function PackageRouteProvider({ children }: { children: ReactNode }) {
  const [route, setRouteState] = useState<RouteCoords | null>(null);

  const setRoute = useCallback(
    (from: [number, number], to: [number, number]) => {
      setRouteState({ from, to });
    },
    []
  );

  const clearRoute = useCallback(() => setRouteState(null), []);

  return (
    <PackageRouteContext.Provider
      value={{ route, setRoute, clearRoute }}
    >
      {children}
    </PackageRouteContext.Provider>
  );
}

export function usePackageRoute() {
  const ctx = useContext(PackageRouteContext);
  if (!ctx) {
    throw new Error("usePackageRoute must be used within PackageRouteProvider");
  }
  return ctx;
}
