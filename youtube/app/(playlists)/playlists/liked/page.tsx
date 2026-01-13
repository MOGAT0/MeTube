"use client";

import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import Link from "next/link";

// --- Your Custom Video Card Component ---
const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [vidTitle, set_vidTitle] = useState(video.title || ""); // Fallback to DB title
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vidDescription, set_vidDescription] = useState(video.desc || "");

  useEffect(() => {
    // 1. Fetch Thumbnail
    const fetchThumbnail = async () => {
      if (video.thumbnail){
        setThumbnailUrl(video.thumbnail);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_THUMBNAIL_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        setThumbnailUrl(data.thumbnail);
      } catch (error) {
        console.error("Failed to fetch thumbnail:", error);
      }
    };

    // 2. Fetch Metadata
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        set_vidDescription(data.description);
        set_vidTitle(data.title);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };

    if (video.vid_url) {
      fetchThumbnail();
      // Optional: Only fetch metadata if title is missing in DB
      if (!video.title) fetchMetadata();
    }
  }, [video.vid_url, video.title]);

  return (
    <div className="border border-gray-200 p-4 m-2 hover:shadow-md transition-shadow">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}&id=${video.id}`}>
        {thumbnailUrl ? (
          <div>
            <div className="aspect-video w-full overflow-hidden bg-black">
                <img 
                    src={thumbnailUrl} 
                    alt={vidTitle || "Thumbnail"} 
                    className="w-full h-full object-cover" 
                />
            </div>
            <p className="mt-3 font-bold text-sm line-clamp-2">{vidTitle || "Untitled Video"}</p>
            <p className="text-xs text-gray-500 mt-1">
                Liked on {new Date(video.likedAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-200 animate-pulse flex items-center justify-center">
             {/* <span className="text-xs text-gray-400">Loading...</span> */}
          </div>
        )}
      </Link>
    </div>
  );
};

// --- The Main Page Component ---
const LikedVideosPage = () => {
  // CHANGED: Use .getLiked instead of .getAll
  const { data: likedVideos, isLoading } = trpc.video.getLiked.useQuery();

  if (isLoading) {
    return (
        <div className="p-8 text-center text-gray-500">
            Loading your liked videos...
        </div>
    );
  }

  if (!likedVideos || likedVideos.length === 0) {
    return (
        <div className="p-8 text-center text-gray-500">
            You haven't liked any videos yet.
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold p-4">Liked Videos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {likedVideos.map((video) => (
            <VideoCard video={video} key={video.id} />
        ))}
        </div>
    </div>
  );
};

export default LikedVideosPage;