"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut } from "lucide-react"

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
        <LogOut
            className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            onClick={handleLogout}
        />
    )
}
