import { SidebarProvider } from "@/components/ui/sidebar";
import { PlaylistNavbar } from "../components/playlist-navbar";
import { PlaylistSidebar } from "../components/playlist-sidebar";
interface PlaylistProps {
    children: React.ReactNode;
};
 
export const Playlist = ({children}: PlaylistProps)=> {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="w-full">
                <PlaylistNavbar />
                <div className="flex min-h-screen pt-16">
                    <PlaylistSidebar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};
