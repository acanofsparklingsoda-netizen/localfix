import type { Metadata } from "next";
import { AuthPageShell } from "@/components/SiteShell";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Local Fix",
  description: "Create a Local Fix account to post repair problems or browse local worker leads.",
};

export default function SignupPage() {
  return (
    <AuthPageShell>
      <SignupForm />
    </AuthPageShell>
  );
}
