import React from "react"
import { Badge } from "@/components/ui/badge"

export type StatusType = "planned" | "in-progress" | "shipped"

interface StatusBadgeProps {
    status: StatusType
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    // Using explicit tailwind classes for custom branding
    const variants: Record<StatusType, string> = {
        planned: "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
        "in-progress": "bg-[#fffbea] text-amber-700 border-transparent hover:bg-[#fff7d1]", // Soft yellow
        shipped: "bg-[#b9ff66] text-black border-transparent hover:opacity-90", // Loom Green
    }

    const labels: Record<StatusType, string> = {
        planned: "Planned",
        "in-progress": "In Progress",
        shipped: "Shipped",
    }

    return (
        <Badge className={variants[status] + " " + className} variant="outline">
            {labels[status]}
        </Badge>
    )
}
