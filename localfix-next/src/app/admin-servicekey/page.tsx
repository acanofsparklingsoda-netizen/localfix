import type { Metadata } from "next";
import { AdminServiceKeyPage } from "@/components/AdminServiceKeyPage";
import { SiteHeader } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Local Fix - Job Submissions (private)",
  robots: { index: false, follow: false },
};

export default function AdminServiceKeyRoute() {
  return (
    <>
      <SiteHeader active="" />
      <AdminServiceKeyPage />
    </>
  );
}
