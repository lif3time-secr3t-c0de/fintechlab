import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { CreateWorkspaceForm } from "@/components/workspaces/CreateWorkspaceForm";

export default async function WorkspacesPage(): Promise<JSX.Element> {
  const user = await requireAppUser();
  if (!user) return <p className="text-sm text-muted-foreground">Sign in to view workspaces.</p>;
  if (!process.env.DATABASE_URL) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Workspaces</h2>
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No database configured — running in local/demo mode.</p>
      </section>
    );
  }

  const workspaces: { id: string; name: string; slug: string }[] = await prisma.workspace.findMany({
    where: { members: { some: { userId: user.id } } },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Workspaces</h2>
      <CreateWorkspaceForm />
      {workspaces.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No workspaces yet. Create your first team workspace to share environments.
        </p>
      ) : (
        <div className="grid gap-2">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/dashboard/workspaces/${workspace.id}`}
              className="rounded-md border border-border p-3 hover:bg-muted"
            >
              <p className="font-medium">{workspace.name}</p>
              <p className="text-sm text-muted-foreground">{workspace.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
