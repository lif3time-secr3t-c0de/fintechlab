"use client";

import type { ApiType } from "@/types/sandbox";
import { cn } from "@/lib/utils";

const apiTypes: ApiType[] = ["KYC", "AML", "OPEN_BANKING", "ACH", "SWIFT", "SEPA"];

export function ApiSelector({
  value,
  onChange,
}: {
  value: ApiType;
  onChange: (value: ApiType) => void;
}): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      {apiTypes.map((type) => (
        <button
          key={type}
          type="button"
          className={cn(
            "rounded-md border border-border p-2 text-sm",
            value === type ? "border-primary bg-muted" : "hover:bg-muted",
          )}
          onClick={() => onChange(type)}
          aria-label={`Select ${type} API`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
