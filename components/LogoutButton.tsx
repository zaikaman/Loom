"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout02Icon } from "@hugeicons/core-free-icons"

export function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            toast.success("Logged out successfully")
            router.push("/login")
        } catch {
            toast.error("Logout failed")
        }
    }

    return (
        <HugeiconsIcon
            icon={Logout02Icon}
            className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            onClick={handleLogout}
        />
    )
}
