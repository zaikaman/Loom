"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Users, Globe } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function SettingsPage() {
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
                            <Input defaultValue="Loom Inc." />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Workspace URL</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground bg-secondary px-3 py-2 rounded-md border border-input">loom.so/</span>
                                <Input defaultValue="loom-inc" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/20 border-t border-border px-6 py-4">
                        <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white" onClick={() => toast.success("Workspace settings saved")}>Update Workspace</Button>
                    </CardFooter>
                </Card>

                {/* Team Members */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" /> Team Members
                                </CardTitle>
                                <CardDescription>Manage who has access to this workspace.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast("Invite link copied to clipboard")}>Invite Member</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "John Doe", email: "john@example.com", role: "Owner" },
                                { name: "Sarah Chen", email: "sarah@example.com", role: "Admin" },
                                { name: "Mike Ross", email: "mike@example.com", role: "Member" },
                            ].map((member, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar fallback={member.name[0]} />
                                        <div>
                                            <p className="text-sm font-medium leading-none">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">{member.role}</Badge>
                                        {member.role !== "Owner" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => toast.error("Cannot remove members in demo mode")}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
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
                            {/* Mock Switch */}
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
                            {/* Mock Switch Off */}
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
