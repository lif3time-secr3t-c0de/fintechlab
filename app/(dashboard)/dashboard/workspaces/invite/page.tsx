import Link from "next/link";

export default function InvitePage() {
  return (
    <section className="mx-auto max-w-2xl py-16">
      <h1 className="text-2xl font-semibold">Invite user to workspace</h1>
      <p className="text-muted-foreground">Choose a workspace, then use its secure member invitation form.</p>
      <Link href="/dashboard/workspaces" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground">Choose workspace</Link>
    </section>
  );
}
