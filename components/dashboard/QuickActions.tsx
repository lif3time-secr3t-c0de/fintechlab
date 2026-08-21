import Link from "next/link";
import { Card } from "@/components/ui/card";

export function QuickActions(): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <Link href="/dashboard/sandbox">Run mock API request</Link>
      </Card>
      <Card>
        <Link href="/dashboard/copilot">Ask AI co-pilot</Link>
      </Card>
      <Card>
        <Link href="/dashboard/compliance">Generate checklist</Link>
      </Card>
    </div>
  );
}
