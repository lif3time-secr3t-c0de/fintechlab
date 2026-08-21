import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/server/user";
import { InviteMemberForm } from "@/components/workspaces/InviteMemberForm";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

export default async function WorkspaceDetailPage({ params }: WorkspacePageProps): Promise<JSX.Element> {
  const user = await requireAppUser();
  if (!user) return <p className="text-sm text-muted-foreground">Sign in to view this workspace.</p>;
  if (!process.env.DATABASE_URL) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No database configured — running in local/demo mode.</p>
    );
  }

  const workspace: { name: string; slug: string; members: { id: string; role: string; user: { email: string; name?: string | null } }[] } | null = await prisma.workspace.findFirst({
    where: { id: params.workspaceId, members: { some: { userId: user.id } } },
    select: {
      name: true,
      slug: true,
      members: {
        select: {
          id: true,
          role: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!workspace) {
    return <p className="text-sm text-muted-foreground">Workspace not found.</p>;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{workspace.name}</h2>
        <p className="text-sm text-muted-foreground">{workspace.slug}</p>
      </div>
      <InviteMemberForm workspaceId={params.workspaceId} />
      {workspace.members.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No members yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspace.members.map((member) => (
                <tr key={member.id} className="border-t border-border">
                  <td className="p-2">{member.user.name ?? "Unknown"}</td>
                  <td className="p-2">{member.user.email}</td>
                  <td className="p-2">
                    <form method="post" action={`/api/workspaces/members/${member.id}`} className="flex items-center gap-2">
                      <input type="hidden" name="workspaceId" value={workspace.slug} />
                      <select name="role" defaultValue={member.role} className="rounded-md border px-2 py-1 text-sm">
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                        <option value="OWNER">Owner</option>
                      </select>
                      <button type="submit" className="rounded bg-primary px-3 py-1 text-white text-sm">Save</button>
                    </form>
                  </td>
                  <td className="p-2">
                    <form method="post" action={`/api/workspaces/members/${member.id}`}>
                      <input type="hidden" name="_method" value="delete" />
                      <button type="submit" className="rounded border border-destructive px-3 py-1 text-sm text-destructive">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
