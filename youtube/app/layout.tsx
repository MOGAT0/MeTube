import type { Metadata } from "next";
import  {Inter} from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
  title: "MeTube",
  description: "Minions Hub",
  icons:{
    icon:"/metube-icon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/"}>
      <html lang="en">
        <body
          className={inter.className}
        >
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
