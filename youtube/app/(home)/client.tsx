"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {

    const [data] = trpc.hello.useSuspenseQuery({
        text:"client"
    })

    return (
        <div>
            {data.greeting}
        </div>
    )
}