import type { Metadata } from "next";
import { SupportPilotDemo } from "@/components/modules/supportpilot-demo";

export const metadata: Metadata = {
  title: "SupportPilot AI",
  description: "A structured support demonstration using sample articles.",
};

export default function SupportPilotPage() {
  return <SupportPilotDemo />;
}
