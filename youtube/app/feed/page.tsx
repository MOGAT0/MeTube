"use client";

import { useEffect } from "react";

const Page = ()=> {

    useEffect(()=> {
        console.log("test");
        
    },[])

    return(
        <div>
            <p>feed Page</p>
        </div>
    );
}

export default Page;