import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireAppUser() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("Authenticated Clerk user has no email address.");
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null;
  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email: primaryEmail,
      name: fullName,
    },
    update: { email: primaryEmail, name: fullName },
  });

  if (!existingUser) {
    const ownerName = fullName ?? primaryEmail.split("@")[0] ?? "My";
    const workspace = await prisma.workspace.create({
      data: {
        name: `${ownerName}'s Workspace`,
        slug: `personal-${user.id}`,
        ownerId: user.id,
      },
    });
    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
    });
    const pendingInvite = await prisma.waitlistEntry.findUnique({ where: { email: primaryEmail } });
    if (pendingInvite?.name === "Workspace invitation" && pendingInvite.company) {
      const invitedWorkspace = await prisma.workspace.findUnique({ where: { id: pendingInvite.company }, select: { id: true } });
      if (invitedWorkspace) {
        await prisma.workspaceMember.upsert({ where: { userId_workspaceId: { userId: user.id, workspaceId: invitedWorkspace.id } }, update: {}, create: { userId: user.id, workspaceId: invitedWorkspace.id, role: "MEMBER" } });
        await prisma.waitlistEntry.delete({ where: { id: pendingInvite.id } });
      }
    }
  }

  return user;
}
