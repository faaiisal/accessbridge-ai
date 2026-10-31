import type { Metadata } from "next";
import { AccessLensWorkspace } from "@/components/modules/accesslens-workspace";

export const metadata: Metadata = {
  title: "AccessLens AI",
  description:
    "Run focused, local accessibility checks on HTML and React JSX snippets.",
};

export default function AccessLensPage() {
  return <AccessLensWorkspace />;
}
