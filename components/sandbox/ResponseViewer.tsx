import { Badge } from "@/components/ui/badge";

export function ResponseViewer({
  body,
  statusCode,
  latencyMs,
}: {
  body: string;
  statusCode: number | null;
  latencyMs: number | null;
}): JSX.Element {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-3 flex items-center gap-2">
        <Badge>Status {statusCode ?? "-"}</Badge>
        <Badge>{latencyMs ?? "-"}ms</Badge>
      </div>
      <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">{body}</pre>
    </div>
  );
}
