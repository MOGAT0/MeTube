"use client";

import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

import { SearchLayout } from "@/modules/search/ui/layouts/search-layout";

const VideoCard = ({ video }: { video: any }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [vidTitle, set_vidTitle] = useState(video.title || "");
  const [vidDescription, set_vidDescription] = useState(video.desc || "");

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
      } catch (error) {
        console.error("Failed to fetch thumbnail:", error);
      }
    };

    const fetchMetadata = async () => {
      if (!video.vid_url) return;
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
      if (!video.title) fetchMetadata();
    }
  }, [video.vid_url, video.title]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 m-2 hover:shadow-md transition-shadow bg-white">
      <Link href={`/watch?v=${encodeURIComponent(video.vid_url)}&id=${video.id}`}>
        {thumbnailUrl ? (
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                <img src={thumbnailUrl} alt={vidTitle || "Thumbnail"} className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-bold line-clamp-2">{vidTitle || "Untitled Video"}</p>
          </div>
        ) : (
          <div className="w-full h-40 bg-gray-200 animate-pulse flex items-center justify-center rounded-md">
            <span className="text-gray-400 text-xs">Loading...</span>
          </div>
        )}
      </Link>
    </div>
  );
};


const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const { data: videos, isLoading } = trpc.video.search.useQuery(
    { q: query || "" },
    { enabled: !!query }
  );

  if (!query) return <div className="p-8 text-center text-gray-500">Please enter a search term.</div>;
  if (isLoading) return <div className="p-8 text-center text-gray-500">Searching for "{query}"...</div>;

  if (!videos || videos.length === 0) {
    return (
        <div className="p-8 text-center">
            <p className="text-lg font-semibold">No results found for "{query}"</p>
            <p className="text-gray-500">Try searching for something else.</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Search results for "{query}"</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
                <VideoCard video={video} key={video.id} />
            ))}
        </div>
    </div>
  );
};


const SearchPage = () => {
    return (
        <SearchLayout>
            <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
                <SearchResults />
            </Suspense>
        </SearchLayout>
    )
}

export default SearchPage;