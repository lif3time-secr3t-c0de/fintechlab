import React from 'react';

export default function WaitlistConfirmPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6 py-16">
      <h1 className="text-3xl font-bold">Waitlist sign-up complete</h1>
      <p className="text-muted-foreground">Thanks — you have been added to the waitlist. A confirmation email is on its way.</p>
      <div className="mt-6">
        <a href="/" className="inline-block rounded-md bg-primary px-4 py-2 text-white">Return home</a>
      </div>
    </section>
  );
}
