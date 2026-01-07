import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/watch-navbar";
import { HomeSidebar } from "../components/watch-sidebar";
interface WatchLayoutProps {
    children: React.ReactNode;
};
 
export const WatchLayout = ({children}: WatchLayoutProps)=> {
    return (
        <SidebarProvider open={false}>
            <div className="w-full">
                <HomeNavbar />
                <div className="flex min-h-screen pt-16">
                    <HomeSidebar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};
