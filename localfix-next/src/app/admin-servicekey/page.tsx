import type { Metadata } from "next";
import { AdminServiceKeyPage } from "@/components/AdminServiceKeyPage";

export const metadata: Metadata = {
  title: "Local Fix - Job Submissions (private)",
  robots: { index: false, follow: false },
};

export default function AdminServiceKeyRoute() {
  return <AdminServiceKeyPage />;
}
