"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function TopBar({ onMenuToggle }: { onMenuToggle: () => void }): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onMenuToggle} aria-label="Open navigation menu" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
