"use client";

import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation"; // To get URL params
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react"; // Icon to remove video (optional feature)

const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [vidTitle, set_vidTitle] = useState(video.title || "");

  useEffect(() => {
 
    const fetchThumbnail = async () => {
      if (!video.vid_url) return;
      if(video.thumbnail){
        setThumbnailUrl(video.thumbnail);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_THUMBNAIL_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        setThumbnailUrl(data.thumbnail);
      } catch (error) { console.error(error); }
    };
    // Fetch Metadata
    const fetchMetadata = async () => {
      if (!video.vid_url) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        set_vidTitle(data.title);
      } catch (error) { console.error(error); }
    };

    fetchThumbnail();
    if (!video.title) fetchMetadata();
  }, [video.vid_url, video.title]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}&id=${video.id}`} className="flex-auto">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black relative">
           {thumbnailUrl ? (
             <img src={thumbnailUrl} alt={vidTitle} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gray-200 animate-pulse" />
           )}
        </div>
        <p className="mt-3 font-bold text-sm line-clamp-2">{vidTitle || "Untitled Video"}</p>
      </Link>
    </div>
  );
};

// --- Main Details Page ---
const PlaylistDetailsPage = () => {
  const params = useParams();
  const playlistId = params.playlistId as string;

  const { data, isLoading, error } = trpc.playlist.getDetails.useQuery(
    { id: playlistId },
    { enabled: !!playlistId }
  );

  if (isLoading) return <div className="p-8">Loading playlist...</div>;
  if (error || !data) return <div className="p-8">Playlist not found.</div>;

  const { playlist, videos } = data;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{videos.length} videos</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-gray-500 py-10">This playlist is empty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailsPage;