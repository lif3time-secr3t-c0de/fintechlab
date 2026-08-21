import Link from "next/link";

export function Footer(): JSX.Element {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-4 py-8 text-sm text-muted-foreground">
        <Link href="/">Product</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
    </footer>
  );
}
