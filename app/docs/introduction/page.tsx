import { DocsContent } from "@/components/docs/DocsContent";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowRightIcon,
    Structure03Icon,
    BubbleChatIcon,
    SparklesIcon
} from "@hugeicons/core-free-icons";

function FeatureItem({
    icon: Icon,
    title,
    children
}: {
    icon: any;
    title: string;
    children: React.ReactNode
}) {
    return (
        <div className="flex gap-4 p-4 border rounded-lg bg-card/50 border-border">
            <div className="flex-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" strokeWidth={2} />
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-foreground mb-1 mt-0 leading-none">{title}</h3>
                <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                    {children}
                </p>
            </div>
        </div>
    )
}

export default function IntroductionPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Introduction
                </h1>
                <p className="text-xl text-muted-foreground">
                    A high-level overview of Loom and its core philosophy.
                </p>
            </div>

            <DocsContent>
                <div className="text-lg leading-relaxed text-muted-foreground">
                    <p>
                        <strong className="text-foreground font-semibold">Loom</strong> represents a shift in how product teams manage public roadmaps.
                        Instead of maintaining a separate "wishlist" that quickly becomes stale, Loom bridges the gap between your community's feedback and your team's actual execution.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 my-8 not-prose">
                    <FeatureItem icon={Structure03Icon} title="Headless Architecture">
                        Decoupled frontend and backend. Build your own roadmap UI or use our ready-made React components.
                    </FeatureItem>
                    <FeatureItem icon={BubbleChatIcon} title="Thread-Centric">
                        Every feature request starts as a discussion. Upvote, comment, and refine ideas before they enter development.
                    </FeatureItem>
                    <FeatureItem icon={SparklesIcon} title="Real-time Updates">
                        Changes in your status reflect instantly. Keep your users in the loop without checking multiple tools.
                    </FeatureItem>
                </div>

                <h2>The Core Problem</h2>
                <p>
                    Most roadmap tools are actually just <em>"lists of potential ideas"</em>. They rarely reflect what is purely being worked on.
                </p>
                <blockquote className="border-l-2 border-primary pl-6 py-1 italic text-muted-foreground my-6">
                    "A roadmap that isn't connected to your issue tracker is just a wish list."
                </blockquote>
                <p>
                    Loom takes a different approach by treating your roadmap as a derivative of your actual engineering tasks and user conversations.
                    It is designed to be the <strong>single source of truth</strong> for what is happening next.
                </p>

            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <div></div>
                <Link href="/docs/quickstart" className="group flex flex-col items-end gap-1 text-right">
                    <span className="text-sm text-muted-foreground">Next</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Quickstart <HugeiconsIcon icon={ArrowRightIcon} className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
