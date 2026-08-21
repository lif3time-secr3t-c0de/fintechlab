interface SandboxApiTypePageProps {
  params: { apiType: string };
}

export default function SandboxApiTypePage({ params }: SandboxApiTypePageProps): JSX.Element {
  return (
    <section>
      <h2 className="text-2xl font-semibold">{params.apiType.toUpperCase()} API details</h2>
      <p className="mt-2 text-muted-foreground">Use this endpoint in the sandbox page to run configurable scenarios and inspect request logs.</p>
    </section>
  );
}
