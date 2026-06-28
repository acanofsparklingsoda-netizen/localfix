import type { Metadata } from "next";
import { AuthPageShell } from "@/components/SiteShell";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Local Fix for Workers",
  description: "Create a Local Fix worker account to browse and respond to repair jobs near you.",
};

export default function SignupPage() {
  return (
    <AuthPageShell ctaHref="/login" ctaLabel="Log in">
      <SignupForm />
    </AuthPageShell>
  );
}
