"use client";

const prompts = [
  "What compliance do I need to launch a neobank in the UK?",
  "Stress-test my lending business model",
  "Compare Stripe vs Plaid for my use case",
  "Generate a PSD2 compliance checklist",
];

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }): JSX.Element {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="rounded-md border border-border p-3 text-left text-sm hover:bg-muted"
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
