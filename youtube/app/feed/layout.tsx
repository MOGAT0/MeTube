interface LayoutProps {
    children : React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {

    console.log("layout");
    

    return ( 
        <div>{children}</div>
     );
}
 
export default Layout;