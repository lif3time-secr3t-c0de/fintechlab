"use client";

import { Textarea } from "@/components/ui/textarea";

export function ContextPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Product context</h3>
      <Textarea
        aria-label="Product context"
        placeholder="Describe your product, target customer, pricing, and market..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
