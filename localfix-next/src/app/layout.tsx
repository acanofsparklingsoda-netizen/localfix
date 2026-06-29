import type { Metadata } from "next";
import "../styles/styles.css";
import "../styles/app.css";
import "../styles/auth.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatWidget } from "@/components/ChatWidget";
import { assetPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Local Fix",
  description:
    "Local Fix connects homeowners with local workers for small home repair jobs.",
  icons: { icon: assetPath("/favicon.png") },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
