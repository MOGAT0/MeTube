"use client";

import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import Link from "next/link";

const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [vidTitle, set_vidTitle] = useState(video.title || "");
  const [vidDescription, set_vidDescription] = useState(video.desc || "");
  const updateMutation = trpc.video.updateMetadata.useMutation();

  useEffect(() => {
    const fetchThumbnail = async () => {
      if (!video.vid_url) return;

      if (video.thumbnail) {
        setThumbnailUrl(video.thumbnail);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_THUMBNAIL_RETRIEVER}${video.vid_url}`);
        const data = await response.json();
        
        // setThumbnailUrl(video.thumbnail);
        setThumbnailUrl(data.thumbnail);
        
        if(!video.thumbnail){
          updateMutation.mutate({
            id: video.id,
            thumbnail: data.thumbnail
          })
        }

      } catch (error) {
        console.error("Failed to fetch thumbnail:", error);
      }
    };

    const fetchMetadata = async () => {
      if (!video.vid_url) return;
      
      if (video.title){
        set_vidTitle(video.title);
        return;
      }

      if (video.desc){
        set_vidDescription(video.desc);
        return;
      }


      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${video.vid_url}`);
        const data = await response.json();

        set_vidDescription(data.description);
        set_vidTitle(data.title);

        if (!video.title || video.title === "") {
            console.log("Saving new metadata to DB:", data.title);
            updateMutation.mutate({
                id: video.id,
                title: data.title,
                desc: data.description || ""
            });
        }

      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }

    if (video.vid_url) {
      fetchThumbnail();
      if (!video.title) {
        fetchMetadata();
      } else {
        set_vidTitle(video.title);
      }
    }
  }, [video.vid_url, video.id, video.title]);

  return (
    <div className="border p-4 m-2 rounded-lg hover:shadow-lg transition-shadow bg-white">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}&id=${video.id}`}>
        {thumbnailUrl ? (
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                <img src={thumbnailUrl} alt={vidTitle || "Thumbnail"} className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-bold line-clamp-2">{vidTitle || "Loading..."}</p>
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 animate-pulse flex items-center justify-center rounded-md">
            <span className="text-gray-400 text-sm">Loading...</span>
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