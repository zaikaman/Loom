"use client"

import { useEffect, useState } from "react"
import {
    ChevronRight,
    Loader2,
    MapIcon,
    ThumbsUp,
    MessageSquare,
    Calendar,
    User,
    TrendingUp,
    RefreshCw
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface FeedRoadmap {
    id: string
    title: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    visibility: "public" | "private"
    lastUpdated: string
    createdAt: string
    author?: {
        id: string
        username: string
        avatarUrl?: string
    }
    featureCount: number
    totalUpvotes: number
}

export default function FeedPage() {
    const [roadmaps, setRoadmaps] = useState<FeedRoadmap[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchFeed = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) {
                setIsRefreshing(true)
            }

            const res = await fetch("/api/feed")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch feed")
            }

            setRoadmaps(data.roadmaps || [])
            setError(null)

            if (showRefreshToast) {
                toast.success("Feed refreshed!")
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch feed"
            setError(message)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchFeed()
    }, [])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#191a23]">Discover</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Explore public roadmaps from the community
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchFeed(true)}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card className="mb-6 border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <p className="text-amber-800 text-sm">{error}</p>
                        <p className="text-amber-600 text-xs mt-2">
                            The feed uses a shared tag to discover public roadmaps.
                            Create a roadmap and publish it to get started!
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!error && roadmaps.length === 0 && (
                <Card className="text-center py-16">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <MapIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#191a23]">No public roadmaps yet</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Be the first to publish a roadmap to the community feed!
                            </p>
                        </div>
                        <Link href="/roadmaps">
                            <Button variant="outline">
                                <MapIcon className="h-4 w-4 mr-2" />
                                View Your Roadmaps
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Feed */}
            <div className="space-y-4">
                {roadmaps.map((roadmap) => (
                    <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200 hover:border-slate-300">
                            <CardContent className="p-6">
                                {/* Author & Time */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="mr-3">
                                        <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                                            {roadmap.author?.avatarUrl ? (
                                                <img
                                                    src={roadmap.author.avatarUrl}
                                                    alt={roadmap.author.username}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#191a23] to-slate-600">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-[#191a23]">
                                            {roadmap.author?.username || "Anonymous"}
                                        </span>
                                        <span className="text-slate-400 mx-2">·</span>
                                        <span className="text-sm text-slate-500">
                                            {formatDate(roadmap.createdAt)}
                                        </span>
                                    </div>
                                    <StatusBadge status={roadmap.status} />
                                </div>

                                {/* Title */}
                                <h2 className="text-lg font-semibold text-[#191a23] mb-2 group-hover:underline">
                                    {roadmap.title}
                                </h2>

                                {/* Description */}
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                    {roadmap.description || "No description provided"}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <MapIcon className="h-4 w-4" />
                                        <span>{roadmap.featureCount} features</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{roadmap.totalUpvotes} upvotes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 ml-auto">
                                        <span className="text-xs">View roadmap</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
