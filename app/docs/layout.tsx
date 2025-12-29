import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <DocsHeader />
            <div className="flex-1">
                <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] max-w-screen-2xl">
                    <DocsSidebar />
                    <main className="relative py-6 lg:gap-10 lg:py-10 pl-8 pr-8">
                        <div className="mx-auto w-full min-w-0 max-w-3xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
