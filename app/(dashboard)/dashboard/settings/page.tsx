import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage(): JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="text-muted-foreground">Manage your profile, security, connected accounts, and active sessions.</p>
      <div className="overflow-x-auto pt-4"><UserProfile routing="hash" /></div>
    </section>
  );
}
