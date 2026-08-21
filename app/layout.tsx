import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FintechLab",
  description: "Fintech API sandbox and AI co-pilot for builders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider>
            <Providers>
              {children}
              <SonnerToaster />
            </Providers>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
