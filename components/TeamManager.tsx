"use client"

import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserGroup02Icon,
    PlusSignIcon,
    Cancel01Icon,
    Loading03Icon,
    ChampionIcon,
    PencilEdit01Icon,
    ViewIcon,
    UserRemove01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TeamMember {
    userId: string
    username: string
    displayName?: string
    avatarUrl?: string
    role: "owner" | "editor" | "viewer"
    invitedAt: string
    status: "pending" | "accepted"
}

interface TeamManagerProps {
    roadmapId: string
    isOwner: boolean
    onClose?: () => void
}

export function TeamManager({ roadmapId, isOwner, onClose }: TeamManagerProps) {
    const [team, setTeam] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showInvite, setShowInvite] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName?: string }[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor")
    const [isInviting, setIsInviting] = useState(false)

    useEffect(() => {
        fetchTeam()
    }, [roadmapId])

    const fetchTeam = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/roadmaps/${roadmapId}/team`)
            if (res.ok) {
                const data = await res.json()
                setTeam(data.team || [])
            }
        } catch (error) {
            console.error("Failed to fetch team:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const res = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                // Filter out users already in team
                const teamUserIds = team.map(m => m.userId)
                setSearchResults(data.users?.filter((u: { id: string }) => !teamUserIds.includes(u.id)) || [])
            }
        } catch (error) {
            console.error("Search failed:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleInvite = async (userId: string) => {
        setIsInviting(true)
        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/team`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role: inviteRole })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to invite team member")
            }

            toast.success("Team member added!")
            setSearchQuery("")
            setSearchResults([])
            setShowInvite(false)
            fetchTeam()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to invite"
            toast.error(message)
        } finally {
            setIsInviting(false)
        }
    }

    const handleRemoveMember = async (userId: string, username: string) => {
        if (!confirm(`Remove ${username} from the team?`)) return

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/team?userId=${userId}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to remove team member")
            }

            toast.success("Team member removed")
            fetchTeam()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to remove"
            toast.error(message)
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "owner": return <HugeiconsIcon icon={ChampionIcon} className="h-3 w-3 text-amber-500" />
            case "editor": return <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3 text-blue-500" />
            case "viewer": return <HugeiconsIcon icon={ViewIcon} className="h-3 w-3 text-slate-400" />
            default: return null
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "owner": return "bg-amber-100 text-amber-700 border-amber-200"
            case "editor": return "bg-blue-100 text-blue-700 border-blue-200"
            case "viewer": return "bg-slate-100 text-slate-600 border-slate-200"
            default: return ""
        }
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserGroup02Icon} className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-sm">Team</span>
                    <Badge variant="secondary" className="text-xs">{team.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowInvite(!showInvite)}
                        >
                            <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3 mr-1" />
                            Add
                        </Button>
                    )}
                    {onClose && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Invite Section */}
            {showInvite && isOwner && (
                <div className="p-4 border-b border-slate-100 bg-blue-50/50">
                    <div className="space-y-3">
                        <div className="relative">
                            <Input
                                placeholder="Search by username..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pr-8"
                            />
                            {isSearching && (
                                <HugeiconsIcon icon={Loading03Icon} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                            )}
                        </div>

                        {/* Role Selection */}
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-500">Role:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    checked={inviteRole === "editor"}
                                    onChange={() => setInviteRole("editor")}
                                    className="h-3.5 w-3.5"
                                />
                                <HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3 text-blue-500" />
                                <span>Editor</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    checked={inviteRole === "viewer"}
                                    onChange={() => setInviteRole("viewer")}
                                    className="h-3.5 w-3.5"
                                />
                                <HugeiconsIcon icon={ViewIcon} className="h-3 w-3 text-slate-400" />
                                <span>Viewer</span>
                            </label>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 bg-slate-200 text-xs flex items-center justify-center">
                                                {user.username[0].toUpperCase()}
                                            </Avatar>
                                            <div>
                                                <span className="text-sm font-medium">{user.username}</span>
                                                {user.displayName && (
                                                    <span className="text-xs text-slate-400 ml-1">
                                                        ({user.displayName})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => handleInvite(user.id)}
                                            disabled={isInviting}
                                        >
                                            {isInviting ? (
                                                <HugeiconsIcon icon={Loading03Icon} className="h-3 w-3 animate-spin" />
                                            ) : (
                                                "Add"
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-2">
                                No users found
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Team List */}
            <div className="divide-y divide-slate-100">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <HugeiconsIcon icon={Loading03Icon} className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                ) : team.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                        No team members yet
                    </div>
                ) : (
                    team.map((member) => (
                        <div
                            key={member.userId}
                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={member.avatarUrl}
                                    className="h-8 w-8 bg-slate-200 text-sm font-medium flex items-center justify-center"
                                    fallback={member.username[0].toUpperCase()}
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{member.username}</span>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${getRoleBadgeColor(member.role)}`}>
                                            {getRoleIcon(member.role)}
                                            {member.role}
                                        </span>
                                    </div>
                                    {member.displayName && (
                                        <span className="text-xs text-slate-400">{member.displayName}</span>
                                    )}
                                </div>
                            </div>
                            {isOwner && member.role !== "owner" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:text-red-500"
                                    onClick={() => handleRemoveMember(member.userId, member.username)}
                                >
                                    <HugeiconsIcon icon={UserRemove01Icon} className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
