type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;


const Page = async (props: { searchParams: SearchParams }) => {
    const searchParams = await props.searchParams;
    const videoUrl = searchParams.v as string;
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];


    
    return (
        <div className="max-w-5xl mx-auto p-4">
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
            <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            ></iframe>
        </div>
        
        </div>
  );
};

export default Page;