"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
    id: string
    username: string
    email: string
    displayName?: string
    bio?: string
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        bio: ""
    })

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    setFormData({
                        displayName: data.user.displayName || "",
                        email: data.user.email || "",
                        bio: data.user.bio || ""
                    })
                }
            } catch (err) {
                toast.error("Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: formData.displayName,
                    bio: formData.bio
                })
            })

            if (!res.ok) {
                throw new Error("Failed to update profile")
            }

            toast.success("Profile updated successfully!")
        } catch (err) {
            toast.error("Failed to save changes")
        } finally {
            setIsSaving(false)
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your public profile and account settings.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Header / Avatar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Public Avatar</CardTitle>
                        <CardDescription>This is your public display picture.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar
                            className="h-24 w-24 border-4 border-background shadow-sm"
                            fallback={user?.displayName?.[0] || user?.username?.[0] || "U"}
                        />
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-fit" onClick={() => toast.info("Image upload coming soon")}>
                                <Camera className="mr-2 h-4 w-4" /> Change Avatar
                            </Button>
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="displayName" className="text-sm font-medium leading-none">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="displayName"
                                    placeholder="John Doe"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    disabled
                                    className="pl-10 bg-slate-50"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="bio" className="text-sm font-medium leading-none">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                placeholder="Tell us a little about yourself"
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                    <div className="flex items-center p-6 pt-0">
                        <Button
                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
