"use client";

import AppInit from "@libs/src/components/AppInit";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInit />
      {children}
    </>
  );
}
