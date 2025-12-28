"use client"

import { useEffect, useState } from "react"
import {
    ChevronRight,
    Share2,
    MoreHorizontal,
    Plus,
    MessageSquare,
    ThumbsUp,
    Calendar,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface Feature {
    id: string
    title: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    date: string
    votes: number
    comments: number
    roadmapId: string
    updates?: { id: string; author: string; date: string; text: string }[]
}

interface Roadmap {
    id: string
    title: string
    body?: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    visibility: "public" | "private"
    createdAt: string
    updatedAt: string
}

export default function RoadmapDetailPage() {
    const params = useParams()
    const roadmapId = params.id as string

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [features, setFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)

                const [roadmapRes, featuresRes] = await Promise.all([
                    fetch(`/api/roadmaps/${roadmapId}`),
                    fetch(`/api/roadmaps/${roadmapId}/features`)
                ])

                if (!roadmapRes.ok) {
                    throw new Error("Roadmap not found")
                }

                const roadmapData = await roadmapRes.json()
                setRoadmap(roadmapData.roadmap)

                if (featuresRes.ok) {
                    const featuresData = await featuresRes.json()
                    setFeatures(featuresData.features || [])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }

        if (roadmapId) {
            fetchData()
        }
    }, [roadmapId])

    const handleUpvote = async (featureId: string, featureTitle: string) => {
        // In a real app, we'd call an API endpoint for voting
        toast.success(`Upvoted: ${featureTitle}`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !roadmap) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-destructive">{error || "Roadmap not found"}</p>
                <Link href="/roadmaps">
                    <Button variant="outline">← Back to Roadmaps</Button>
                </Link>
            </div>
        )
    }

    const dateRange = roadmap.createdAt
        ? `${new Date(roadmap.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - Present`
        : "In Progress"

    return (
        <div className="flex h-full flex-col md:flex-row overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8 max-w-5xl">
                    {/* Breadcrumb & Header */}
                    <div className="mb-8">
                        <div className="flex items-center text-sm text-slate-500 mb-4">
                            <Link href="/roadmaps" className="hover:text-slate-900 transition-colors">My Roadmaps</Link>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span className="text-slate-900 font-medium">{roadmap.title}</span>
                        </div>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-slate-900">{roadmap.title}</h1>
                                    <StatusBadge status={roadmap.status} />
                                </div>
                                <p className="text-slate-500 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> {dateRange}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    toast.success("Link copied to clipboard")
                                }}>
                                    <Share2 className="h-4 w-4 mr-2" /> Share
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => toast("More options menu")}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white" onClick={() => toast("Feature creation coming soon")}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                                </Button>
                            </div>
                        </div>

                        {roadmap.description && (
                            <p className="text-slate-600 mt-4">{roadmap.description}</p>
                        )}
                    </div>

                    <Separator className="mb-8" />

                    {/* Timeline View */}
                    {features.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Plus className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No features yet</h3>
                            <p className="text-slate-500 mb-4">Add your first feature to this roadmap.</p>
                            <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white" onClick={() => toast("Feature creation coming soon")}>
                                <Plus className="mr-2 h-4 w-4" /> Add Feature
                            </Button>
                        </div>
                    ) : (
                        <div className="relative space-y-8 pl-4 md:pl-0">
                            {/* Vertical timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-slate-200 hidden md:block" />

                            {features.map((feature) => (
                                <div key={feature.id} className="relative md:pl-16 group">
                                    {/* Timeline Node */}
                                    <div className="absolute left-[30px] top-6 h-3 w-3 rounded-full border-2 border-white bg-[#191a23] shadow-sm z-10 hidden md:block group-hover:scale-125 transition-transform" />

                                    <Card className="mb-6 hover:shadow-md transition-shadow duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span>{feature.date}</span>
                                                        <span>•</span>
                                                        <StatusBadge status={feature.status} className="scale-90 origin-left" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-500 hover:text-[#191a23]"
                                                        onClick={() => handleUpvote(feature.id, feature.title)}
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-1" /> {feature.votes}
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-slate-600 mb-4">{feature.description}</p>

                                            {/* Threaded Updates */}
                                            {feature.updates && feature.updates.length > 0 && (
                                                <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100 mb-4">
                                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Updates</h4>
                                                    {feature.updates.map((update) => (
                                                        <div key={update.id} className="flex gap-3">
                                                            <Avatar className="h-8 w-8" fallback={update.author[0]} />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm font-medium text-slate-900">{update.author}</span>
                                                                    <span className="text-xs text-slate-400">{update.date}</span>
                                                                </div>
                                                                <p className="text-sm text-slate-600">{update.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-black hover:bg-secondary -ml-2"
                                                    onClick={() => toast("Opening comments thread...")}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-2" /> {feature.comments} Comments
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Details Panel (Desktop only) */}
            <div className="w-80 border-l border-slate-200 bg-white p-6 hidden xl:block overflow-y-auto">
                <h3 className="font-semibold text-slate-900 mb-4">Roadmap Details</h3>

                <div className="space-y-6">
                    <div>
                        <span className="text-sm text-slate-500 block mb-1">Visibility</span>
                        <Badge variant={roadmap.visibility === "public" ? "default" : "outline"} className="capitalize">
                            {roadmap.visibility}
                        </Badge>
                    </div>

                    <div>
                        <span className="text-sm text-slate-500 block mb-1">Features</span>
                        <span className="text-2xl font-bold text-slate-900">{features.length}</span>
                    </div>

                    <div>
                        <span className="text-sm text-slate-500 block mb-1">Total Votes</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {features.reduce((sum, f) => sum + f.votes, 0)}
                        </span>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="font-medium text-slate-900 mb-3">Activity</h4>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-[#191a23] shrink-0" />
                                <p className="text-slate-600">
                                    Roadmap created on {roadmap.createdAt ? new Date(roadmap.createdAt).toLocaleDateString() : "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
