import { HydrateClient, trpc } from "@/trpc/server";
import { PageClient } from "./client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {

  void trpc.hello.prefetch({ text:"world"});

  return (
    <div>
      {/* <Image src={"/icon.svg"} width={50} height={50} alt="Logo"/> */}
      <HydrateClient>
        <Suspense fallback = {<p>loading...</p>}>
        <ErrorBoundary fallback = {<p>Error...</p>}>
          <PageClient/>
        </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </div>
  )
}