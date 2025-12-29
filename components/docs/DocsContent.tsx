import { cn } from "@/lib/utils";

interface DocsContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DocsContent({ className, children, ...props }: DocsContentProps) {
    return (
        <div
            className={cn(
                "max-w-none",
                // Override default styles - no prose
                "[&_p]:leading-7 [&_p]:mb-4 [&_p]:text-muted-foreground",
                "[&_ul]:my-6 [&_ul]:ml-6 [&_ul]:list-disc [&_li]:mt-2 [&_li]:text-muted-foreground",
                "[&_code]:relative [&_code]:rounded [&_code]:bg-secondary [&_code]:px-[0.3rem] [&_code]:py-[0.2rem] [&_code]:font-mono [&_code]:text-sm [&_code]:font-medium [&_code]:text-primary",
                "[&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:bg-zinc-950 [&_pre]:text-zinc-50 [&_pre]:shadow-sm [&_pre]:border [&_pre]:border-border",
                "[&_.lead]:text-xl [&_.lead]:text-muted-foreground [&_.lead]:mb-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
