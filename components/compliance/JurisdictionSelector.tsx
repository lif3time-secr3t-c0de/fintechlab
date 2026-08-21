const jurisdictions = ["UK", "EU", "US", "SG", "AU"] as const;

export function JurisdictionSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <select
      aria-label="Jurisdiction"
      className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {jurisdictions.map((jurisdiction) => (
        <option key={jurisdiction} value={jurisdiction}>
          {jurisdiction}
        </option>
      ))}
    </select>
  );
}
