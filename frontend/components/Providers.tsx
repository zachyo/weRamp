"use client";

import { ReactNode, useState, useEffect } from "react";

/**
 * Client-only providers wrapper.
 * Uses dynamic import() to avoid touching @stacks/connect 
 * during Turbopack prerendering / SSR.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<{
    children: ReactNode;
  }> | null>(null);

  useEffect(() => {
    // Dynamic import — only runs in the browser after hydration
    import("./WalletProvider").then((mod) => {
      setProvider(() => mod.WalletProvider);
    });
  }, []);

  if (!Provider) {
    // During SSR/prerender or before the provider loads,
    // render children without wallet context
    return <>{children}</>;
  }

  return <Provider>{children}</Provider>;
}
