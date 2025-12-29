"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Shield,
    Key,
    Download,
    AlertTriangle,
    Loader2,
    Eye,
    EyeOff,
    Check,
    Copy,
    LogOut,
    Trash2,
    FileJson
} from "lucide-react"
import { toast } from "sonner"

interface User {
    id: string
    username: string
    email: string
    displayName?: string
    extendedData?: {
        defaultRoadmapPrivate?: boolean
    }
}

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [isSavingPrivacy, setIsSavingPrivacy] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    // Privacy settings
    const [defaultPrivate, setDefaultPrivate] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    setDefaultPrivate(data.user.extendedData?.defaultRoadmapPrivate ?? false)
                }
            } catch {
                toast.error("Failed to load settings")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleExportData = async () => {
        try {
            setIsExporting(true)

            // Fetch all user's roadmaps
            const res = await fetch("/api/roadmaps")
            if (!res.ok) throw new Error("Failed to fetch roadmaps")

            const roadmaps = await res.json()

            // Create export data
            const exportData = {
                exportedAt: new Date().toISOString(),
                user: {
                    id: user?.id,
                    username: user?.username,
                    email: user?.email,
                    displayName: user?.displayName
                },
                roadmaps: roadmaps
            }

            // Download as JSON
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `loom-export-${user?.username}-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Data exported successfully!")
        } catch (err) {
            console.error(err)
            toast.error("Failed to export data")
        } finally {
            setIsExporting(false)
        }
    }

    const handleCopyUserId = async () => {
        if (user?.id) {
            await navigator.clipboard.writeText(user.id)
            toast.success("User ID copied to clipboard")
        }
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setIsChangingPassword(true)

            const res = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to change password")
            }

            toast.success("Password changed successfully!")

            // Reset form
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to change password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleSavePrivacy = async () => {
        try {
            setIsSavingPrivacy(true)

            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    extendedData: {
                        ...user?.extendedData,
                        defaultRoadmapPrivate: defaultPrivate
                    }
                })
            })

            if (!res.ok) throw new Error("Failed to save")

            toast.success("Privacy settings saved!")
            setUser(prev => prev ? {
                ...prev,
                extendedData: {
                    ...prev.extendedData,
                    defaultRoadmapPrivate: defaultPrivate
                }
            } : null)
        } catch (err) {
            toast.error("Failed to save privacy settings")
        } finally {
            setIsSavingPrivacy(false)
        }
    }

    const handleLogoutAllDevices = async () => {
        try {
            // Log out current session
            await fetch("/api/auth/logout", { method: "POST" })
            toast.success("Logged out successfully")
            router.push("/login")
        } catch {
            toast.error("Failed to logout")
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== user?.username) {
            toast.error("Please type your username to confirm")
            return
        }

        try {
            setIsDeleting(true)

            const res = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    confirmUsername: deleteConfirmText
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete account")
            }

            toast.success("Account deleted successfully")
            router.push("/login")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete account")
        } finally {
            setIsDeleting(false)
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
                <p className="text-muted-foreground mt-1">Manage your account, security, and data preferences.</p>
            </div>

            <div className="grid gap-8">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-muted-foreground" /> Account Information
                        </CardTitle>
                        <CardDescription>View your account details and unique identifiers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Username</label>
                            <div className="flex items-center gap-2">
                                <Input value={user?.username || ""} disabled className="bg-slate-50" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <Input value={user?.email || ""} disabled className="bg-slate-50" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">User ID</label>
                            <div className="flex items-center gap-2">
                                <Input value={user?.id || ""} disabled className="bg-slate-50 font-mono text-xs" />
                                <Button variant="outline" size="icon" onClick={handleCopyUserId} title="Copy User ID">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Your unique identifier for API integrations.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-muted-foreground" /> Security
                        </CardTitle>
                        <CardDescription>Manage your password and session security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Active Sessions</p>
                                <p className="text-xs text-muted-foreground">Sign out of this browser session.</p>
                            </div>
                            <Button variant="outline" onClick={handleLogoutAllDevices} className="gap-2">
                                <LogOut className="h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/20 border-t border-border px-6 py-4">
                        <Button
                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                            {isChangingPassword ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                            ) : (
                                <><Check className="mr-2 h-4 w-4" /> Update Password</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-muted-foreground" /> Privacy
                        </CardTitle>
                        <CardDescription>Control the default visibility of your roadmaps.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium">Default Roadmaps to Private</span>
                                <span className="text-xs text-muted-foreground">
                                    New roadmaps will be private by default. You can still make them public individually.
                                </span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={defaultPrivate}
                                className={`h-6 w-11 rounded-full p-1 cursor-pointer transition-colors ${defaultPrivate ? 'bg-[#b9ff66]' : 'bg-slate-200 hover:bg-slate-300'
                                    }`}
                                onClick={() => setDefaultPrivate(!defaultPrivate)}
                            >
                                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${defaultPrivate ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/20 border-t border-border px-6 py-4">
                        <Button
                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            onClick={handleSavePrivacy}
                            disabled={isSavingPrivacy}
                        >
                            {isSavingPrivacy ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                "Save Privacy Settings"
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Data Export */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-muted-foreground" /> Data Export
                        </CardTitle>
                        <CardDescription>Download a copy of all your roadmap data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-4 p-4 border border-border rounded-lg bg-secondary/10">
                            <div className="flex items-center gap-3">
                                <FileJson className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Export All Data</p>
                                    <p className="text-xs text-muted-foreground">
                                        Download all your roadmaps and features as a JSON file.
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="gap-2">
                                {isExporting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>
                                ) : (
                                    <><Download className="h-4 w-4" /> Export</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showDeleteConfirm ? (
                            <div className="flex items-center justify-between space-x-4 p-4 border border-red-200 rounded-lg bg-red-50/50">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                                    <p className="text-xs text-muted-foreground">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="gap-2 bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Account
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 border border-red-300 rounded-lg bg-red-50 space-y-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-600">Are you absolutely sure?</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This will permanently delete your account, all roadmaps, and all data.
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">
                                        Type <span className="font-mono bg-red-100 px-1 rounded">{user?.username}</span> to confirm
                                    </label>
                                    <Input
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="Enter your username"
                                        className="border-red-200"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteConfirm(false)
                                            setDeleteConfirmText("")
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== user?.username}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {isDeleting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                                        ) : (
                                            "I understand, delete my account"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
