"use client";

import { trpc } from "@/trpc/client";
import { useEffect } from "react";

interface ViewLoggerProps {
  videoId: string;
}

export const ViewLogger = ({ videoId }: ViewLoggerProps) => {
  const { mutate } = trpc.video.logView.useMutation();

  useEffect(() => {
    // Trigger the mutation exactly once when the component mounts
    mutate({ videoId });
  }, [videoId, mutate]);

  // This component is invisible
  return null;
};
