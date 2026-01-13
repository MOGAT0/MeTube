"use client";

import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react"; 

const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [vidTitle, set_vidTitle] = useState(video.title || "");

  useEffect(() => {
    // 1. Fetch Thumbnail
    const fetchThumbnail = async () => {
      if (!video.vid_url) return;

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

    // 2. Fetch Metadata (only if title is missing)
    const fetchMetadata = async () => {
      if (!video.vid_url) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        set_vidTitle(data.title);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };

    fetchThumbnail();
    if (!video.title) fetchMetadata();
  }, [video.vid_url, video.title]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}&id=${video.id}`}>
        {thumbnailUrl ? (
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-black relative">
                <img 
                    src={thumbnailUrl} 
                    alt={vidTitle || "Thumbnail"} 
                    className="w-full h-full object-cover" 
                />
                {/* Optional: Overlay "Watched" label */}
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                    Watched
                </div>
            </div>
            <p className="mt-3 font-bold text-sm line-clamp-2">{vidTitle || "Untitled Video"}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={12} />
                {new Date(video.viewedAt).toLocaleDateString()} at {new Date(video.viewedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
             <span className="text-xs text-gray-400">Loading...</span>
          </div>
        )}
      </Link>
    </div>
  );
};

// --- Main Page Component ---
const HistoryPage = () => {
  const { data: history, isLoading } = trpc.video.getHistory.useQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  }

  if (!history || history.length === 0) {
    return <div className="p-8 text-center text-gray-500">No watch history found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((video) => (
          <VideoCard video={video} key={video.id} />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;