"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Plus, Check, ListPlus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/nextjs";

export const SaveToPlaylist = ({ videoId }: { videoId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const utils = trpc.useUtils();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  
  // Fetch playlists
  const { data: playlists, isLoading } = trpc.playlist.getPlaylistsForUser.useQuery(
    { videoId },
    { enabled: isOpen } // Only fetch when modal opens
  );

  // Mutation: Create Playlist
  const createMutation = trpc.playlist.create.useMutation({
    onSuccess: () => {
      utils.playlist.getPlaylistsForUser.invalidate({ videoId });
      setNewPlaylistName("");
      setIsCreating(false);
      toast.success("Playlist created");
    },
  });

  // Mutation: Toggle Video
  const toggleMutation = trpc.playlist.toggleVideo.useMutation({
    onSuccess: () => {
      utils.playlist.getPlaylistsForUser.invalidate({ videoId });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createMutation.mutate({ name: newPlaylistName });
  };

  return (
    <div className="relative">
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() =>{
            if(!isSignedIn){
                return clerk.openSignIn();
            }
            setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 transition-colors cursor-pointer rounded-full bg-gray-100 border border-gray-200"
      >
        <ListPlus size={18} strokeWidth={1.5} className="text-gray-700" />
        <span className="text-sm font-semibold text-gray-700">Save</span>
      </button>

      {/* DROPDOWN / MODAL */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Save to playlist</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">
                <X size={16} />
              </button>
            </div>

            {/* List of Playlists */}
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {isLoading ? (
                <div className="text-sm text-gray-500 text-center py-2">Loading...</div>
              ) : (
                playlists?.map((pl) => (
                  <label key={pl.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input 
                      type="checkbox"
                      checked={pl.containsVideo}
                      disabled={toggleMutation.isPending}
                      onChange={() => toggleMutation.mutate({ playlistId: pl.id, videoId })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700 truncate">{pl.name}</span>
                  </label>
                ))
              )}
            </div>

            {/* Create New Playlist Section */}
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 w-full p-2 rounded transition-colors"
              >
                <Plus size={16} /> Create new playlist
              </button>
            ) : (
              <form onSubmit={handleCreate} className="mt-2">
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name..."
                  className="w-full text-sm border-b-2 border-gray-300 focus:border-black outline-none py-1 mb-3"
                />
                <div className="flex justify-end gap-2">
                    <button 
                        type="button"
                        onClick={() => setIsCreating(false)} 
                        className="text-xs font-semibold text-gray-500 hover:text-black"
                    >
                        CANCEL
                    </button>
                    <button 
                        type="submit" 
                        disabled={!newPlaylistName.trim() || createMutation.isPending}
                        className="text-xs font-semibold text-blue-600 disabled:opacity-50"
                    >
                        CREATE
                    </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};