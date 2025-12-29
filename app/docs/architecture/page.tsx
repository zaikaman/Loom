import { DocsContent } from "@/components/docs/DocsContent";
import { Step, Steps } from "@/components/docs/Steps";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
    Layers01Icon,
    PaintBoardIcon,
    Database01Icon,
    StartUpIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    Folder01Icon,
    File01Icon
} from "@hugeicons/core-free-icons";

function TechCard({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
    return (
        <div className="flex gap-4 p-4 border border-border rounded-xl bg-card">
            <div className="flex-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" strokeWidth={2} />
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-1 mt-0 leading-none">{title}</h4>
                <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

function FileTreeItem({ name, description, isFile = false }: { name: string; description: string; isFile?: boolean }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <HugeiconsIcon
                icon={isFile ? File01Icon : Folder01Icon}
                className={`size-5 mt-0.5 ${isFile ? "text-muted-foreground" : "text-blue-500"}`}
            />
            <div>
                <code className="text-sm font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded">{name}</code>
                <p className="text-sm text-muted-foreground m-0 mt-1 leading-normal">
                    {description}
                </p>
            </div>
        </div>
    )
}

export default function ArchitecturePage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Architecture
                </h1>
                <p className="text-xl text-muted-foreground">
                    Under the hood of Loom&apos;s headless roadmap engine.
                </p>
            </div>

            <DocsContent>
                <p className="lead">
                    Loom is built on a modern stack designed for performance, scalability, and ease of modification.
                    At its core, it separates the <em>presentation layer</em> (your roadmap UI) from the <em>data layer</em> (threads and discussions).
                </p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Tech Stack</h2>
                <p>
                    We use industry-standard tools to ensure Loom is easy to deploy and maintain.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                    <TechCard
                        title="Framework"
                        description="Next.js 16 (App Router) for server-side rendering and routing."
                        icon={Layers01Icon}
                    />
                    <TechCard
                        title="Styling"
                        description="Tailwind CSS v4 + Shadcn UI for a beautiful, customizable design system."
                        icon={PaintBoardIcon}
                    />
                    <TechCard
                        title="Backend"
                        description="Foru.ms API for managing threads, users, and permissions."
                        icon={Database01Icon}
                    />
                    <TechCard
                        title="AI Engine"
                        description="Vercel AI SDK + OpenAI for intelligent triage and auto-tagging."
                        icon={StartUpIcon}
                    />
                </div>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Data Flow</h2>
                <p>
                    How a user interaction becomes a roadmap item:
                </p>

                <Steps>
                    <Step title="1. Interaction">
                        User posts a feature request or feedback via the widget or the main portal.
                    </Step>
                    <Step title="2. Thread Creation">
                        Loom creates a <code>Thread</code> in the backend. This thread holds the title, description, and initial metadata (status: <em>Open</em>).
                    </Step>
                    <Step title="3. AI Triage">
                        An background agent analyzes the thread using the configured OpenAI model. It assigns tags (Bug, Enhancement, feature) and estimates impact.
                    </Step>
                    <Step title="4. Roadmap Sync">
                        The thread is visualized on the Roadmap board based on its status. As you drag-and-drop items, Loom updates the thread's metadata in real-time.
                    </Step>
                </Steps>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Directory Structure</h2>
                <p>
                    Key directories you should know about:
                </p>

                <div className="not-prose border border-border rounded-xl bg-card p-6 mt-4">
                    <div className="space-y-4">
                        <FileTreeItem
                            name="app/(dashboard)"
                            description="The main application UI requiring authentication. Contains the sidebar, header, and protected pages."
                        />
                        <FileTreeItem
                            name="app/api"
                            description="Server-side API routes. Handles data mutations and securely proxies requests to the Foru.ms API."
                        />
                        <FileTreeItem
                            name="components/ui"
                            description="Reusable UI primitives (buttons, inputs, cards) built with Shadcn UI and radix-ui."
                        />
                        <FileTreeItem
                            name="lib/forums.ts"
                            description="The core SDK wrapper. Contains typed functions for interacting with the backend data layer."
                            isFile
                        />
                    </div>
                </div>
            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <Link href="/docs/quickstart" className="group flex flex-col items-start gap-1 text-left">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 transition-transform group-hover:-translate-x-1" /> Quickstart
                    </span>
                </Link>
                <Link href="/docs/configuration" className="group flex flex-col items-end gap-1 text-right">
                    <span className="text-sm text-muted-foreground">Next</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Configuration <HugeiconsIcon icon={ArrowRightIcon} className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
