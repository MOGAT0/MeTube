"use client";

import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import Link from "next/link";

const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [vidTitle, set_vidTitle] = useState("");
  const [vidDescription, set_vidDescription] = useState("");

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_THUMBNAIL_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        setThumbnailUrl(data.thumbnail);
      } catch (error) {
        console.error("Failed to fetch thumbnail:", error);
      }
    };

    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        set_vidDescription(data.description);
        set_vidTitle(data.title);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }

    if (video.vid_url) {
      fetchThumbnail();
      fetchMetadata();
    }
  }, [video.vid_url]);

  return (
    <div className="border p-4 m-2">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}`}>
        {thumbnailUrl ? (
          <div>
            <img src={thumbnailUrl} alt={vidTitle || "Thumbnail"} className="w-full h-auto" />
            <p className="mt-2 font-bold">{vidTitle}</p>
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 animate-pulse flex items-center justify-center">
            
          </div>
        )}
      </Link>
    </div>
  );
};

export const PageClient = () => {
  const { data: vids, isLoading } = trpc.video.getAll.useQuery();

  if (isLoading) return <div>Loading videos...</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {vids?.map((video) => (
        <VideoCard video={video} key={video.id} />
      ))}
    </div>
  );
};