import type { Metadata } from "next";
import { AuthPageShell } from "@/components/SiteShell";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Local Fix",
  description: "Log in to Local Fix to post repairs, manage worker leads, or view admin tools.",
};

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginForm />
    </AuthPageShell>
  );
}
