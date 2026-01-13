"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/utils/trcp";

export const MetadataFetcher = ({ videoUrl }: { videoUrl: string }) => {
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (videoUrl) {
        handleMetadataFetch();
    }
  }, [videoUrl]);

  const handleMetadataFetch = async () => {
    try {
      const encodedUrl = encodeURIComponent(videoUrl);
      const response = await fetch(`${process.env.NEXT_PUBLIC_METADATA_RETRIEVER}${encodedUrl}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      setVidTitle(data.title || "No Title Found");
      setVidDesc(data.description || "No Description Found");

    } catch (error) {
      console.error(`Failed to fetch Metadata:`, error);
      setError("Could not load video details.");
    }
  };

  const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {

      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };


  return (
    <div className="mt-4">
      {!vidTitle && !vidDesc ? (
          <p className="text-black">Loading...</p>
      ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">{vidTitle}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">
              {renderDescriptionWithLinks(vidDesc)}
            </p>
          </>
      )}
    </div>
  );
};