"use client";

import { Button } from "@/components/ui/button";
import { UserCircleIcon, View } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";

const AuthButton = () => {
    const { user, isLoaded } = useUser();

    return (
        <>
            <SignedIn>
                <h1>Hello, {user?.fullName}</h1>
                <UserButton />
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button
                        variant={"outline"}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-900 rounded-full shadow-none cursor-pointer"
                    >
                        <UserCircleIcon className="size-4" />
                        Sign in
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    );
}

export default AuthButton;