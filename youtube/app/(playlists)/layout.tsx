interface LayoutProps {
    children : React.ReactNode;
}

import { Playlist } from "@/modules/playlist/ui/layouts/playlist-layout";

const Layout = ({children} : LayoutProps) => {
    return (
        <Playlist>{children}</Playlist>
    )
}


export default Layout;