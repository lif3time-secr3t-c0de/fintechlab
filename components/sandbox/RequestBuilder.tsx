"use client";

import CodeMirror from "@uiw/react-codemirror";

export function RequestBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <div className="rounded-md border border-border">
      <CodeMirror value={value} minHeight="260px" onChange={onChange} />
    </div>
  );
}
