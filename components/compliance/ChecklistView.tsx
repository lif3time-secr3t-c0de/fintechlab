import type { ComplianceItem } from "@/lib/utils/compliance";

export function ChecklistView({ items }: { items: ComplianceItem[] }): JSX.Element {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Generate a checklist to begin compliance planning.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2">Category</th>
            <th className="p-2">Requirement</th>
            <th className="p-2">Regulation</th>
            <th className="p-2">Priority</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.category}-${index}`} className="border-t border-border">
              <td className="p-2">{item.category}</td>
              <td className="p-2">{item.requirement}</td>
              <td className="p-2">{item.regulation}</td>
              <td className="p-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.priority === "critical" ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" : item.priority === "high" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"}`}>{item.priority}</span></td>
              <td className="p-2 capitalize">{item.status.replace("_", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
