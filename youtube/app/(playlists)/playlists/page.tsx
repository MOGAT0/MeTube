"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { ListVideo, PlaySquare } from "lucide-react";

const PlaylistLibrary = () => {
  const { data: playlists, isLoading } = trpc.playlist.getAll.useQuery();

  if (isLoading) return <div className="p-8">Loading library...</div>;

  if (!playlists || playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="bg-gray-100 p-6 rounded-full">
            <ListVideo size={48} className="text-gray-400" />
        </div>
        <p className="text-gray-500">No playlists created yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <PlaySquare className="text-black" />
        Your Playlists
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((pl) => (
          <Link 
            key={pl.id} 
            href={`/playlists/${pl.id}`} // Clicking leads to details page
            className="group block"
          >
            {/* Playlist Card Visual */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md transition-all flex items-center justify-center mb-3">
              {/* Stack effect using pseudo-elements logic or just specific styling */}
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <ListVideo size={40} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              
              {/* Overlay Count */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                {pl.videoCount} videos
              </div>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 truncate">
              {pl.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Updated {new Date(pl.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistLibrary;