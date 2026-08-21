"use client";
export default function ErrorPage({ reset }: { reset: () => void }): JSX.Element { return <div role="alert" className="rounded-md border border-red-500 p-4"><p>The invitation form could not be loaded.</p><button className="mt-2 underline" onClick={reset}>Try again</button></div>; }
