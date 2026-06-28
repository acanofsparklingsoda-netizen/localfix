import type { Metadata } from "next";
import { AuthPageShell } from "@/components/SiteShell";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Local Fix",
  description: "Log in to Local Fix - for local workers and admins.",
};

export default function LoginPage() {
  return (
    <AuthPageShell ctaHref="/signup" ctaLabel="Sign up">
      <LoginForm />
    </AuthPageShell>
  );
}
