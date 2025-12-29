import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Rocket01Icon,
    Structure03Icon,
    Settings01Icon,
    ApiIcon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// Reusable card component for the landing page
function DocCard({
    href,
    title,
    description,
    icon: Icon,
    linkText = "Learn more"
}: {
    href: string;
    title: string;
    description: string;
    icon: any;
    linkText?: string;
}) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
        >
            <div>
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-secondary p-2.5 group-hover:bg-primary/10 transition-colors">
                    <HugeiconsIcon icon={Icon} className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="mt-6 flex items-center text-primary text-sm font-medium">
                {linkText} <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
        </Link>
    );
}

export default function DocsPage() {
    return (
        <div className="space-y-12 pb-10">
            <div className="space-y-4">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Welcome to Loom
                </h1>
                <p className="text-xl text-muted-foreground leading-8 max-w-[800px]">
                    Loom is a headless product roadmap and changelog tool designed for modern engineering teams.
                    Use it to build beautiful, interactive timelines from your threaded discussions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocCard
                    href="/docs/quickstart"
                    title="Quickstart Guide"
                    description="Get up and running in minutes. Deploy your first roadmap and start collecting user feedback."
                    icon={Rocket01Icon}
                    linkText="Start building"
                />
                <DocCard
                    href="/docs/architecture"
                    title="Architecture Deep Dive"
                    description="Understand how Loom's headless architecture works and how to integrate it into your stack."
                    icon={Structure03Icon}
                />
                <DocCard
                    href="/docs/configuration"
                    title="Configuration"
                    description="Learn about environment variables, authentication settings, and deployment options."
                    icon={Settings01Icon}
                    linkText="Configure"
                />
                <DocCard
                    href="/docs/api"
                    title="API Reference"
                    description="Detailed documentation for the Loom API to build custom integrations."
                    icon={ApiIcon}
                    linkText="Explore API"
                />
            </div>

            <div className="border-t border-border pt-10">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-6">
                    What is Loom?
                </h2>
                <div className="prose prose-zinc max-w-none dark:prose-invert text-muted-foreground">
                    <p className="leading-7">
                        Loom bridges the gap between customer feedback and product execution. Unlike traditional roadmap tools that are
                        siloed from your day-to-day workflow, Loom is built to be embedded directly into your application or
                        used as a standalone portal that syncs perfectly with your issue tracker.
                    </p>
                </div>
            </div>
        </div>
    );
}
