import { WatchLayout } from "@/modules/watch/ui/layouts/watch-layout";
interface LayoutProps {
    children: React.ReactNode;
};

const Layout = ({children}: LayoutProps)=> {
    return (
        <WatchLayout>{children}</WatchLayout>
    )
}

export default Layout;
