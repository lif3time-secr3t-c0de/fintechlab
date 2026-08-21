interface LogItem {
  id: string;
  timestamp: string;
  apiType: string;
  status: number;
  latencyMs: number;
  requestBody?: string;
  responseBody?: string;
  pending?: boolean;
}

export function LogsTable({ logs }: { logs: LogItem[] }): JSX.Element {
  if (logs.length === 0) {
    return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No requests yet. Run an API call to see logs.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2">Timestamp</th>
            <th className="p-2">API</th>
            <th className="p-2">Status</th>
            <th className="p-2">Latency</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-border">
              <td colSpan={4} className="p-0">
                <details>
                  <summary className="grid cursor-pointer grid-cols-4 gap-2 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span>{new Date(log.timestamp).toLocaleString()}</span><span>{log.apiType}</span><span>{log.pending ? "Pending" : log.status}</span><span>{log.pending ? "—" : `${log.latencyMs}ms`}</span>
                  </summary>
                  <div className="grid gap-3 border-t border-border bg-muted/40 p-3 md:grid-cols-2">
                    <div><p className="mb-1 font-medium">Request</p><pre className="overflow-x-auto rounded bg-background p-3 text-xs">{log.requestBody ?? "Request body unavailable"}</pre></div>
                    <div><p className="mb-1 font-medium">Response</p><pre className="overflow-x-auto rounded bg-background p-3 text-xs">{log.responseBody ?? "Response body unavailable"}</pre></div>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
