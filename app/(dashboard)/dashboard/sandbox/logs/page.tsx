import { prisma } from "@/lib/prisma";
import { LogsTable } from "@/components/sandbox/LogsTable";
import { requireAppUser } from "@/lib/server/user";

export default async function SandboxLogsPage(): Promise<JSX.Element> {
  const user = await requireAppUser();
  if (!user) return <p className="text-sm text-muted-foreground">Sign in to view request logs.</p>;
  if (!process.env.DATABASE_URL) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Request logs</h2>
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No database configured — logs are unavailable in demo mode.</p>
      </section>
    );
  }

  const logs = await prisma.apiLog.findMany({
    where: { userId: user.id },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      apiType: true,
      statusCode: true,
      latencyMs: true,
      createdAt: true,
      requestBody: true,
      responseBody: true,
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Request logs</h2>
      <LogsTable
        logs={logs.map((log) => ({
          id: log.id,
          timestamp: log.createdAt.toISOString(),
          apiType: log.apiType,
          status: log.statusCode,
          latencyMs: log.latencyMs,
          requestBody: JSON.stringify(log.requestBody, null, 2),
          responseBody: JSON.stringify(log.responseBody, null, 2),
        }))}
      />
    </section>
  );
}
