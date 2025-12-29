import { DocsContent } from "@/components/docs/DocsContent";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Alert02Icon, SparklesIcon, ArrowLeftIcon, ArrowRightIcon } from "@hugeicons/core-free-icons";

function EnvCard({ name, description, required = false }: { name: string; description: string; required?: boolean }) {
    return (
        <div className="flex flex-col gap-2 p-4 border border-border rounded-lg bg-card mb-4 break-all">
            <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{name}</code>
                {required && <span className="text-xs font-medium text-destructive border border-destructive/20 bg-destructive/10 px-2 py-0.5 rounded-full">Required</span>}
            </div>
            <p className="text-sm text-muted-foreground m-0">
                {description}
            </p>
        </div>
    )
}

export default function ConfigurationPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Configuration
                </h1>
                <p className="text-xl text-muted-foreground">
                    Setting up your environment for production.
                </p>
            </div>

            <DocsContent>
                <p className="lead">
                    Loom uses environment variables to manage connections to third-party services like the Foru.ms API, Cloudinary, and OpenAI.
                </p>

                <h2 className="text-2xl font-bold !text-black mt-12 mb-4 border-b border-zinc-200 pb-2">Environment Variables</h2>
                <p>
                    Create a <code>.env.local</code> file in the root directory of your project.
                    You can copy the template from <code>.env.example</code>.
                </p>

                <div className="my-8">
                    <div className="flex items-center gap-2 mb-4">
                        <HugeiconsIcon icon={Alert02Icon} className="text-foreground" />
                        <h3 className="text-foreground m-0">Core Configuration</h3>
                    </div>
                    <div className="not-prose">
                        <EnvCard
                            name="FORUMS_API_KEY"
                            description="The Master API key for the Foru.ms backend. This allows Loom to create threads, manage users, and update statuses on your behalf."
                            required
                        />
                        <EnvCard
                            name="CLOUDINARY_URL"
                            description="Used for persistent storage of roadmap indexes and user avatars. Format: cloudinary://key:secret@cloud_name."
                            required
                        />
                    </div>
                </div>

                <div className="my-8">
                    <div className="flex items-center gap-2 mb-4">
                        <HugeiconsIcon icon={SparklesIcon} className="text-foreground" />
                        <h3 className="text-foreground m-0">AI Intelligence</h3>
                    </div>
                    <div className="not-prose">
                        <EnvCard
                            name="OPENAI_API_KEY"
                            description="Your OpenAI API key starting with sk-..."
                        />
                        <EnvCard
                            name="OPENAI_MODEL"
                            description="The model ID to use for analysis. Defaults to gpt-4-turbo or gpt-4o if not specified."
                        />
                        <EnvCard
                            name="OPENAI_BASE_URL"
                            description="(Optional) Use this to proxy requests if you are using a compatible endpoint (e.g. specialized detailed models)."
                        />
                    </div>
                </div>

                <h2>Next.js Config</h2>
                <p>
                    Loom is a Next.js application. You can further customize the build process in <code>next.config.mjs</code>.
                </p>
            </DocsContent>

            <div className="flex justify-between pt-10 mt-10 border-t border-border">
                <Link href="/docs/architecture" className="group flex flex-col items-start gap-1 text-left">
                    <span className="text-sm text-muted-foreground">Previous</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 transition-transform group-hover:-translate-x-1" /> Architecture
                    </span>
                </Link>
                <Link href="/docs/threads" className="group flex flex-col items-end gap-1 text-right">
                    <span className="text-sm text-muted-foreground">Next</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Thread System <HugeiconsIcon icon={ArrowRightIcon} className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
