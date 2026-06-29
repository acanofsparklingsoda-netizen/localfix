import type { Metadata } from "next";
import { ChatsPage } from "@/components/ChatsPage";

export const metadata: Metadata = {
  title: "Chats | Local Fix",
  description: "View Local Fix repair and worker conversations.",
};

export default function ChatsRoute() {
  return <ChatsPage />;
}
