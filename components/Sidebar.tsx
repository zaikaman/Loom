"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    List,
    PlusCircle,
    User,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/LogoutButton"

const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "My Roadmaps", href: "/roadmaps", icon: List },
    { name: "New Roadmap", href: "/roadmaps/new", icon: PlusCircle },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

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
                <div className="flex items-center px-2">
                    {/* Logo Icon */}
                    <div className="h-8 w-8 rounded bg-primary mr-3 flex items-center justify-center text-primary-foreground font-bold">L</div>
                    <span className="text-xl font-bold text-foreground tracking-tight">Loom</span>
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
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
                                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
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
                        <Avatar src="https://github.com/shadcn.png" alt="@shadcn" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">John Doe</span>
                            <span className="text-xs text-muted-foreground">john@example.com</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>
    )
}
