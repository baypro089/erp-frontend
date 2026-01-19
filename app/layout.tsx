import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@libs/src/store/ReduxProvider";
import AppInit from "@libs/src/components/AppInit";
import ClientOnly from "@libs/src/components/ClientOnly";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Chưa có gì",
};

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
