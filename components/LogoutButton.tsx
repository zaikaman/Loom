"use client"

import { toast } from "sonner"
import { LogOut } from "lucide-react"

export function LogoutButton() {
    return (
        <LogOut
            className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            onClick={() => toast("Logged out (Demo Only)")}
        />
    )
}
