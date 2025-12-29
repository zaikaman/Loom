"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Home01Icon,
    Menu01Icon,
    PlusSignCircleIcon,
    UserIcon,
    Settings01Icon,
    Compass01Icon,
    BubbleChatIcon,
    SparklesIcon,
    Task01Icon,
} from "@hugeicons/core-free-icons"
import LogoIcon from "@/app/assets/icons/logo-icon.svg"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/LogoutButton"

const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home01Icon },
    { name: "Discover", href: "/feed", icon: Compass01Icon },
    { name: "My Roadmaps", href: "/roadmaps", icon: Menu01Icon },
    { name: "PM Dashboard", href: "/pm-dashboard", icon: Task01Icon },
    { name: "Loom AI", href: "/ai", icon: SparklesIcon },
    { name: "Chat", href: "/chat", icon: BubbleChatIcon },
    { name: "New Roadmap", href: "/roadmaps/new", icon: PlusSignCircleIcon },
    { name: "Profile", href: "/profile", icon: UserIcon },
    { name: "Settings", href: "/settings", icon: Settings01Icon },
]

interface UserInfo {
    id: string
    username: string
    email: string
    displayName?: string
    extendedData?: {
        avatarUrl?: string
    }
}

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const [user, setUser] = useState<UserInfo | null>(null)

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                }
            } catch {
                // Silently fail - user will be redirected by proxy if not authenticated
            }
        }
        fetchUser()
    }, [])

    return (
        <div
            className={cn(
                "flex h-screen flex-col justify-between border-r border-border bg-background w-[260px] sticky top-0",
                className
            )}
        >
            {/* Top Section */}
            <div className="flex flex-col p-4 space-y-6">
                {/* Logo */}
                <Link href="/" className="flex items-center px-2 hover:opacity-80 transition-opacity">
                    {/* Logo Icon */}
                    <LogoIcon className="h-8 w-8 mr-3 text-primary" />
                    <span className="text-xl font-bold text-foreground tracking-tight">Loom</span>
                </Link>

                {/* Nav Items */}
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <HugeiconsIcon icon={item.icon} className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom Section: User Profile */}
            <div className="border-t border-border p-4">
                <div className="group flex items-center w-full justify-between hover:bg-secondary/50 p-2 rounded-md cursor-pointer transition-colors relative">
                    <div className="flex items-center space-x-3">
                        <Avatar
                            src={user?.extendedData?.avatarUrl}
                            fallback={user?.displayName?.[0] || user?.username?.[0] || "U"}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {user?.displayName || user?.username || "Loading..."}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {user?.email || "..."}
                            </span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>
    )
}
