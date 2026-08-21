import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/sandbox", label: "Sandbox" },
  { href: "/dashboard/copilot", label: "Co-Pilot" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/workspaces", label: "Workspaces" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }): JSX.Element {
  return (
    <>
      <p className="mb-4 font-semibold">FintechLab</p>
      <nav className="grid gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={onNavigate} className="rounded px-2 py-2 hover:bg-muted">
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }): JSX.Element {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border p-4 md:block">
        <Navigation />
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close navigation menu" className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative h-full w-72 max-w-[85vw] border-r border-border bg-background p-4 shadow-xl">
            <Navigation onNavigate={onMobileClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
