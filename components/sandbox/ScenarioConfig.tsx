"use client";

export function ScenarioConfig({
  latency,
  onLatencyChange,
  mode,
  onModeChange,
}: {
  latency: number;
  onLatencyChange: (value: number) => void;
  mode: "success" | "failure" | "fraud";
  onModeChange: (value: "success" | "failure" | "fraud") => void;
}): JSX.Element {
  return (
    <div className="rounded-md border border-border p-3">
      <label className="block text-sm font-medium">Latency ({latency}ms)</label>
      <input
        aria-label="Latency slider"
        className="mt-2 w-full"
        type="range"
        min={100}
        max={3000}
        value={latency}
        onChange={(event) => onLatencyChange(Number(event.target.value))}
      />
      <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Response scenario">
        {(["success", "failure", "fraud"] as const).map((option) => (
          <button key={option} type="button" aria-pressed={mode === option} onClick={() => onModeChange(option)} className={`rounded-md border px-2 py-2 text-xs capitalize ${mode === option ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
