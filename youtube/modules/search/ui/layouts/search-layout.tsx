import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchNavbar } from "../components/search-navbar";
import { SearchSidebar } from "../components/search-sidebar";
interface SearchLayoutProps {
    children: React.ReactNode;
};
 
export const SearchLayout = ({children}: SearchLayoutProps)=> {
    return (
        <SidebarProvider>
            <div className="w-full">
                <SearchNavbar />
                <div className="flex min-h-screen pt-16">
                    <SearchSidebar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};
