"use client";

import { use } from "react";
import { BlockEditor } from "@/components/BlockEditor";

export default function WorkspacePage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  return <BlockEditor pageId={pageId} />;
}
