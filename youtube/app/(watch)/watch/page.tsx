import { AnalyzeVideo } from "@/modules/watch/ui/components/analyzer/AnalyzeVideo";
import { MetadataFetcher } from "@/modules/watch/ui/components/analyzer/Metadata";
import { UserEngagement } from "@/modules/watch/ui/components/engagements/engagement";
import { ViewLogger } from "@/modules/watch/ui/components/engagements/view-logger";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const Page = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const videoUrl = searchParams.v as string;
  const vidTableId = searchParams.id as string;

  let videoId = "";
  if (videoUrl) {
    if (videoUrl.includes("v=")) {
      videoId = videoUrl.split("v=")[1]?.split("&")[0];
    } else {
      videoId = videoUrl; 
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      {vidTableId && <ViewLogger videoId={vidTableId} />}
      {/* Left Side: Video Player */}
      <div className="w-full md:w-2/3">
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              No Video Selected
            </div>
          )}
          
        </div>
        {vidTableId && <UserEngagement videoId={vidTableId} />}
        <MetadataFetcher videoUrl={videoUrl}/>
      </div>

      {/* Right Side: Analyzer Component */}
      <div className="w-full md:w-1/3">
        {videoUrl && <AnalyzeVideo videoUrl={videoUrl} />}
      </div>
    </div>
  );
};

export default Page;