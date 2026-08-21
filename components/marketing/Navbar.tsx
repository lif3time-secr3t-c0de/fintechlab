import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar(): JSX.Element {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          FintechLab
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="/pricing">Pricing</Link>
          <SignedOut><Link href="/sign-in">Sign in</Link></SignedOut>
          <SignedIn><Link href="/dashboard">Dashboard</Link></SignedIn>
        </nav>
        <SignedOut><Link href="/sign-up"><Button size="sm">Get early access</Button></Link></SignedOut>
        <SignedIn><Link href="/dashboard"><Button size="sm">Open app</Button></Link></SignedIn>
      </div>
    </header>
  );
}
