"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client"; // Import your tRPC client
import { SaveToPlaylist } from "./SaveToPlaylist";

interface UserEngagementProps {
  videoId: string;
}

export const UserEngagement = ({ videoId }: UserEngagementProps) => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();

  // 1. Fetch Like Status & Count
  // 'enabled' ensures we don't fetch if videoId is missing
  const { data } = trpc.video.getLikeStatus.useQuery(
    { videoId },
    { enabled: !!videoId }
  );

  // 2. Mutation to Toggle Like
  const likeMutation = trpc.video.toggleLike.useMutation({
    onSuccess: () => {
      // Refresh the cache to update the number immediately
      utils.video.getLikeStatus.invalidate({ videoId });
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        
      } else {
        
      }
    },
  });

  return (
    <div className="flex items-center justify-start gap-4 p-4">
      <div className="flex items-center overflow-hidden rounded-full bg-gray-100 shadow-sm border border-gray-200">
        
        {/* --- LIKE BUTTON --- */}
        <button
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-200 transition-colors border-r border-gray-300 cursor-pointer disabled:opacity-50`}
          onClick={(e) => {
            if (!isSignedIn) {
              e.preventDefault();
              return clerk.openSignIn();
            }
            // Trigger the mutation
            likeMutation.mutate({ videoId });
          }}
        >
          <ThumbsUp
            size={18}
            strokeWidth={0.5} // Keep your thin stroke style
            className={`${
              data?.viewerReaction === "like"
                ? "fill-black text-black" // Filled if liked
                : "text-gray-600"
            }`}
          />
          <span className="text-sm font-semibold text-gray-700">
            {data?.likeCount || 0}
          </span>
        </button>

        {/* --- DISLIKE BUTTON --- */}
        {/* Note: currently just visual until you add a toggleDislike procedure */}
        <button 
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={(e) => {
                if (!isSignedIn) return clerk.openSignIn();
                // Add dislike logic here later

            }}
        >
          <ThumbsDown
            size={18}
            strokeWidth={0.5}
            className={`${
                data?.viewerReaction === "dislike" 
                ? "fill-black text-black" 
                : "text-gray-600"
            }`}
          />
        </button>
      </div>
      <SaveToPlaylist videoId={videoId} />

    </div>
  );
};