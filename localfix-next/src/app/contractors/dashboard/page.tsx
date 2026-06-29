import type { Metadata } from "next";
import { WorkerDashboard } from "@/components/WorkerDashboard";

export const metadata: Metadata = {
  title: "Worker Dashboard | Local Fix",
  description: "View worker leads, revenue, chats, and job follow-up activity.",
};

export default function ContractorDashboardPage() {
  return <WorkerDashboard />;
}
