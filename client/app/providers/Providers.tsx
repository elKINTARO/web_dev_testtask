"use client";

import { CartProvider } from "@/app/context/CartContext";
import { PackageRouteProvider } from "@/app/context/PackageRouteContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <PackageRouteProvider>{children}</PackageRouteProvider>
    </CartProvider>
  );
}
