import type { Metadata } from "next";
import { ContractorBoard } from "@/components/ContractorBoard";

export const metadata: Metadata = {
  title: "Browse Jobs | Local Fix for Workers",
  description: "Local workers: browse repair jobs posted near you.",
};

export default function ContractorsPage() {
  return <ContractorBoard />;
}
