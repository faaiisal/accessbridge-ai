import type { Metadata } from "next";
import { SkillBridgeDemo } from "@/components/modules/skillbridge-demo";

export const metadata: Metadata = {
  title: "SkillBridge AI",
  description: "A bilingual local learning-plan demonstration.",
};

export default function SkillBridgePage() {
  return <SkillBridgeDemo />;
}
