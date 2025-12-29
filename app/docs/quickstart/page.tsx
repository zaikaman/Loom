
import { DocsContent } from "@/components/docs/DocsContent";
import { Step, Steps } from "@/components/docs/Steps";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@hugeicons/core-free-icons";

export default function QuickstartPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Quickstart
                </h1>
                <p className="text-xl text-muted-foreground">
                    Deploy your first roadmap in under 5 minutes.
                </p>
            </div>

            <DocsContent>
                <Steps>
                    <Step title="Prerequisites">
                        <p>
                            Before you begin, ensure you have the following installed:
                        </p>
                        <ul className="list-disc pl-4 mt-2 mb-4">
                            <li>Node.js 18+</li>
                            <li>npm or pnpm</li>
                        </ul>
                    </Step>

                    <Step title="Clone the repository">
                        <p className="mb-4">
                            Clone the repository and install dependencies:
                        </p>
                        <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-50 overflow-x-auto border border-border">
                            <code>{`git clone https://github.com/zaikaman/Loom.git
cd Loom
npm install`}</code>
                        </pre>
                    </Step>

                    <Step title="Configure Environment">
                        <p className="mb-4">
                            Copy the example environment file to get started:
                        </p>
                        <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-50 overflow-x-auto border border-border">
                            <code>{`cp .env.example .env.local`}</code>
                        </pre>
                    </Step>

                    <Step title="Run Development Server">
                        <p className="mb-4">
                            Start the local development server:
                        </p>
                        <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-50 overflow-x-auto border border-border">
                            <code>{`npm run dev`}</code>
                        </pre>
                        <p className="mt-4">
                            Open <Link href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</Link> to see your application.
                        </p>
                    </Step>
                </Steps>
            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <Link href="/docs/introduction" className="group flex flex-col items-start gap-1 text-left">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 transition-transform group-hover:-translate-x-1" /> Introduction
                    </span>
                </Link>
                <Link href="/docs/architecture" className="group flex flex-col items-end gap-1 text-right">
                    <span className="text-sm text-muted-foreground">Next</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Architecture <HugeiconsIcon icon={ArrowRightIcon} className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div>
    );
}

