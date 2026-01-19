'use client';

import ClientOnly from "@libs/src/components/ClientOnly";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main-layout">
      <ClientOnly>{children}</ClientOnly>
    </div>
  );
}
