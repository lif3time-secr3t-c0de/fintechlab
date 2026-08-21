import { QuickActions } from "@/components/dashboard/QuickActions";
import { UsageStats } from "@/components/dashboard/UsageStats";

export default function DashboardPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>
      <UsageStats />
      <QuickActions />
    </section>
  );
}
