import { DocsContent } from "@/components/docs/DocsContent";
import { Step, Steps } from "@/components/docs/Steps";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
    Message02Icon,
    Task01Icon,
    ArrowLeftIcon,
    ArrowRightIcon
} from "@hugeicons/core-free-icons";

export default function ThreadsPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Thread System
                </h1>
                <p className="text-xl text-muted-foreground">
                    Understanding the core data model.
                </p>
            </div>

            <DocsContent>
                <p className="lead">
                    In Loom, there is no distinction between a "Card" on a roadmap and a "Discussion". They are the same object, viewed through a different lens.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="p-6 border border-border rounded-xl bg-card transition-all hover:shadow-md hover:border-primary/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                                <HugeiconsIcon icon={Message02Icon} className="size-5" />
                            </div>
                            <h3 className="font-bold text-lg m-0">The Thread</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The underlying data structure. It contains the author, the initial post content, and a linear list of replies (comments).
                        </p>
                    </div>
                    <div className="p-6 border border-border rounded-xl bg-card transition-all hover:shadow-md hover:border-primary/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                                <HugeiconsIcon icon={Task01Icon} className="size-5" />
                            </div>
                            <h3 className="font-bold text-lg m-0">The Feature</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The roadmap representation. We decorate the Thread with metadata like <code>status</code>, <code>eta</code>, and <code>votes</code> to turn it into a trackable item.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Lifecycle</h2>
                <p>
                    How a thread moves through the system:
                </p>

                <Steps>
                    <Step title="Drafting & Discussion">
                        A user creates a thread. At this stage, it's just a conversation. Other users can upvote it if they want it.
                    </Step>
                    <Step title="Commitment (Planned)">
                        A Product Manager reviews the thread. If valid, they change the status to <strong>Planned</strong>. This officially puts it on the Roadmap view.
                    </Step>
                    <Step title="Execution (In Progress)">
                        Engineers pick up the work. The status changes to <strong>In Progress</strong>. The original thread remains open for implementation details or clarification questions.
                    </Step>
                    <Step title="Delivery (Shipped)">
                        The feature is live. The thread is marked <strong>Shipped</strong>. It now effectively serves as a changelog entry.
                    </Step>
                </Steps>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Extended Data</h2>
                <p>
                    Loom uses a flexible <code>extendedData</code> JSON field on each thread to store roadmap-specific information without modifying the core schema.
                </p>
                <pre>
                    {`{
  "status": "planned",
  "votes": 42,
  "impact_score": 8.5,
  "tags": ["frontend", "performance"]
}`}
                </pre>
            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <Link href="/docs/configuration" className="group flex flex-col items-start gap-1 text-left">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 transition-transform group-hover:-translate-x-1" /> Configuration
                    </span>
                </Link>
                <Link href="/docs/api" className="group flex flex-col items-end gap-1 text-right">
                    <span className="text-sm text-muted-foreground">Next</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        API Reference <HugeiconsIcon icon={ArrowRightIcon} className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div >
    );
}
