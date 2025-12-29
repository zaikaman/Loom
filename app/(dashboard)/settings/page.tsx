"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bell, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface User {
    id: string
    username: string
    email: string
    displayName?: string
}

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [workspaceName, setWorkspaceName] = useState("")
    const [workspaceSlug, setWorkspaceSlug] = useState("")

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    // Use username as default workspace name/slug
                    setWorkspaceName(data.user.displayName || data.user.username || "My Workspace")
                    setWorkspaceSlug(data.user.username || "workspace")
                }
            } catch {
                toast.error("Failed to load settings")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleSaveWorkspace = async () => {
        try {
            // In a real implementation, this would save to user's extendedData
            toast.success("Workspace settings saved")
        } catch {
            toast.error("Failed to save settings")
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your workspace preferences and team settings.</p>
            </div>

            <div className="grid gap-8">
                {/* Workspace Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-muted-foreground" /> Workspace
                        </CardTitle>
                        <CardDescription>Manage your workspace display name and URL.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Workspace Name</label>
                            <Input
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Workspace URL</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground bg-secondary px-3 py-2 rounded-md border border-input">loom.so/</span>
                                <Input
                                    value={workspaceSlug}
                                    onChange={(e) => setWorkspaceSlug(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/20 border-t border-border px-6 py-4">
                        <Button
                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            onClick={handleSaveWorkspace}
                        >
                            Update Workspace
                        </Button>
                    </CardFooter>
                </Card>



                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-muted-foreground" /> Notifications
                        </CardTitle>
                        <CardDescription>Choose what you want to be notified about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium">Email Notifications</span>
                                <span className="text-xs text-muted-foreground">Receive emails about new roadmap updates.</span>
                            </div>
                            <div
                                className="h-6 w-11 rounded-full bg-[#b9ff66] p-1 cursor-pointer transition-colors hover:opacity-90"
                                onClick={() => toast.success("Notification preference updated")}
                            >
                                <div className="h-4 w-4 rounded-full bg-white shadow-sm ml-5" />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium">Weekly Digest</span>
                                <span className="text-xs text-muted-foreground">Get a summary of all activity once a week.</span>
                            </div>
                            <div
                                className="h-6 w-11 rounded-full bg-slate-200 p-1 cursor-pointer transition-colors hover:bg-slate-300"
                                onClick={() => toast.success("Notification preference updated")}
                            >
                                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
