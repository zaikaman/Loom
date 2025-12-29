import { cn } from "@/lib/utils"

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="ml-4 border-l pl-8 pb-8 last:pb-0 relative border-border">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-primary shadow-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
            </span>
            <h3 className="font-semibold leading-none tracking-tight mb-2 text-foreground">{title}</h3>
            <div className="text-muted-foreground">{children}</div>
        </div>
    )
}

export function Steps({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-12 mt-4">
            {children}
        </div>
    )
}
