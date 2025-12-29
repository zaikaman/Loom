
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    cn
} from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    BookOpen01Icon,
    Rocket01Icon,
    Structure03Icon,
    Settings01Icon,
    ApiIcon,
    BubbleChatIcon
} from "@hugeicons/core-free-icons";

const sidebarData = [
    {
        title: "Getting Started",
        items: [
            { title: "Introduction", href: "/docs/introduction", icon: BookOpen01Icon },
            { title: "Quickstart", href: "/docs/quickstart", icon: Rocket01Icon },
            { title: "Architecture", href: "/docs/architecture", icon: Structure03Icon },
        ],
    },
    {
        title: "Core Concepts",
        items: [
            { title: "Configuration", href: "/docs/configuration", icon: Settings01Icon },
            { title: "Thread System", href: "/docs/threads", icon: BubbleChatIcon },
        ],
    },
    {
        title: "Integration",
        items: [
            { title: "API Reference", href: "/docs/api", icon: ApiIcon },
        ],
    },
];

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto border-r border-border bg-background py-6 pr-6 lg:py-8 pl-8">
            <div className="flex flex-col gap-8">
                {sidebarData.map((section, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                            {section.title}
                        </h4>
                        <div className="flex flex-col gap-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/50",
                                            isActive
                                                ? "bg-secondary text-primary shadow-[inset_3px_0_0_0_var(--color-primary)]"
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <HugeiconsIcon icon={Icon} className={cn("size-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} strokeWidth={2} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
