-- Supabase RLS defense-in-depth. Prisma uses the trusted server connection; browser
-- access is restricted to rows whose Clerk subject matches auth.jwt()->>'sub'.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SandboxScenario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CopilotThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_row" ON "User" FOR SELECT USING ("clerkId" = auth.jwt()->>'sub');
CREATE POLICY "members_read_workspaces" ON "Workspace" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "WorkspaceMember" wm JOIN "User" u ON u.id = wm."userId"
    WHERE wm."workspaceId" = id AND u."clerkId" = auth.jwt()->>'sub')
);
CREATE POLICY "members_read_memberships" ON "WorkspaceMember" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "WorkspaceMember" mine JOIN "User" u ON u.id = mine."userId"
    WHERE mine."workspaceId" = "WorkspaceMember"."workspaceId" AND u."clerkId" = auth.jwt()->>'sub')
);
CREATE POLICY "users_own_logs" ON "ApiLog" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."clerkId" = auth.jwt()->>'sub')
);
CREATE POLICY "members_read_scenarios" ON "SandboxScenario" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "WorkspaceMember" wm JOIN "User" u ON u.id = wm."userId"
    WHERE wm."workspaceId" = "SandboxScenario"."workspaceId" AND u."clerkId" = auth.jwt()->>'sub')
);
CREATE POLICY "users_own_threads" ON "CopilotThread" FOR ALL USING (
  EXISTS (SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."clerkId" = auth.jwt()->>'sub')
);
CREATE POLICY "users_own_usage" ON "UsageRecord" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."clerkId" = auth.jwt()->>'sub')
);
