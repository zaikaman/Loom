import { DocsContent } from "@/components/docs/DocsContent";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftIcon } from "@hugeicons/core-free-icons";

function Endpoint({ method, path }: { method: "GET" | "POST" | "PUT" | "DELETE"; path: string }) {
    const styles = {
        GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        POST: "bg-green-500/10 text-green-500 border-green-500/20",
        PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    }[method];

    return (
        <div className="font-mono text-sm flex items-center gap-4 p-3 border border-border rounded-lg bg-card my-2 hover:border-primary/50 transition-colors">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${styles}`}>
                {method}
            </span>
            <span className="text-foreground font-medium">{path}</span>
        </div>
    )
}

export default function ApiPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    API Reference
                </h1>
                <p className="text-xl text-muted-foreground">
                    Build custom integrations with the Loom API.
                </p>
            </div>

            <DocsContent>
                <p className="lead">
                    The Loom API is RESTful and resource-oriented. All responses are JSON.
                </p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Authentication</h2>
                <p>
                    Currently, the API relies on session-based authentication for frontend usage.
                    For server-side access, you should use the <code>FORUMS_API_KEY</code> to interact directly with the backend.
                </p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Roadmaps</h2>
                <p>Manage your product roadmaps.</p>

                <Endpoint method="GET" path="/api/roadmaps" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">List all roadmaps visible to the current user.</p>

                <Endpoint method="POST" path="/api/roadmaps" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">Create a new roadmap workspace.</p>

                <Endpoint method="GET" path="/api/roadmaps/:id" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">Retrieve a specific roadmap and its metadata.</p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Features (Threads)</h2>
                <p>Interact with individual feature requests.</p>

                <Endpoint method="GET" path="/api/roadmaps/:id/features" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">Get all features (threads) for a specific roadmap.</p>

                <Endpoint method="POST" path="/api/roadmaps/:id/features" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">Create a new feature request on a roadmap.</p>

                <Endpoint method="DELETE" path="/api/features/:id" />
                <p className="text-sm text-muted-foreground ml-1 mb-6">Delete a feature request.</p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Errors</h2>
                <p>
                    The API uses standard HTTP response codes to indicate the success or failure of an API request.
                </p>
                <ul>
                    <li><code>200 OK</code> - Request succeeded.</li>
                    <li><code>400 Bad Request</code> - Invalid input.</li>
                    <li><code>401 Unauthorized</code> - Authentication failed.</li>
                    <li><code>404 Not Found</code> - Resource does not exist.</li>
                </ul>

            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <Link href="/docs/threads" className="group flex flex-col items-start gap-1 text-left">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 transition-transform group-hover:-translate-x-1" /> Thread System
                    </span>
                </Link>
                <div></div>
            </div>
        </div >
    );
}
