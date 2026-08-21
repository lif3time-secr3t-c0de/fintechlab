"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1">
        <TopBar onMenuToggle={() => setMobileNavOpen((open) => !open)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
