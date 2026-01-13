import { Sidebar, SidebarContent, SidebarSeparator }  from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";



export const SearchSidebar = () => {
    return ( 
        <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
            <SidebarContent className="bg-background">
                <MainSection/>
                <SidebarSeparator/>
                <PersonalSection/>
            </SidebarContent>
        </Sidebar>
     );
}
 