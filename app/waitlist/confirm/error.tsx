"use client";
export default function ErrorPage({ reset }: { reset: () => void }): JSX.Element { return <div role="alert" className="mx-auto mt-16 max-w-2xl rounded-md border border-red-500 p-4"><p>Confirmation could not be loaded.</p><button className="mt-2 underline" onClick={reset}>Try again</button></div>; }
