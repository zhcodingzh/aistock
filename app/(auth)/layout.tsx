export const dynamic = 'force-dynamic';
import Link from "next/link";
import React from "react";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {getAuth} from "@/lib/better-auth/auth";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({headers: await headers()});
    if (session?.user) redirect('/')
    return (
        <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
                    <span className="text-2xl font-bold text-teal-400 tracking-tight">AIStock</span>
                </Link>
                <div>{children}</div>
            </div>
        </main>
    )
}
export default Layout
