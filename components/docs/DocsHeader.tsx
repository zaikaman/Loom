"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import LogoIcon from "@/app/assets/icons/logo-icon.svg";

export function DocsHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center px-8">
                <div className="mr-4 flex">
                    <Link href="/docs" className="mr-6 flex items-center space-x-2">
                        <LogoIcon className="h-6 w-6 fill-current text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            Loom Docs
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
                        >
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                            Back to App
                        </Link>
                        <Link
                            href="https://github.com/zaikaman/Loom"
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                            )}
                        >
                            <HugeiconsIcon icon={GithubIcon} className="h-4 w-4" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
