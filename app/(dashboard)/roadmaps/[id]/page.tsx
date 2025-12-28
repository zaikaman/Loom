"use client"

import {
    ChevronRight,
    Share2,
    MoreHorizontal,
    Plus,
    MessageSquare,
    ThumbsUp,
    User as UserIcon,
    Calendar
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useParams } from "next/navigation"
import { toast } from "sonner"

export default function RoadmapDetailPage() {
    const params = useParams()
    // Mock data for a single roadmap (in client component, params is hook based or prop based if server->client)
    // Since we converted to client, we use useParams hook or props. Best to keep data fetch server side and pass down,
    // but for this "all buttons work" refactor, fully client is easiest to mock.

    const roadmap = {
        title: "AI Chat Feature",
        status: "in-progress" as const,
        date: "Dec 2024 - Mar 2025",
        features: [
            {
                id: "f1",
                title: "Model Selection decision",
                status: "shipped" as const,
                description: "Evaluated GPT-4 vs Claude 3. Decided on Claude 3 due to context window size.",
                date: "Dec 15, 2024",
                comments: 12,
                votes: 45,
                expanded: false,
            },
            {
                id: "f2",
                title: "Backend API Implementation",
                status: "in-progress" as const,
                description: "Streaming response handling and websockets setup for real-time chat.",
                date: "Jan 10, 2025",
                comments: 8,
                votes: 23,
                expanded: true,
                updates: [
                    {
                        id: "u1",
                        author: "Sarah Chen",
                        date: "Today",
                        text: "Websockets are now stable in staging. Moving to production stress testing."
                    },
                    {
                        id: "u2",
                        author: "Mike Ross",
                        date: "Yesterday",
                        text: "API rate limiting implemented."
                    }
                ]
            },
            {
                id: "f3",
                title: "Frontend UI Components",
                status: "planned" as const,
                description: "Chat bubble, typing indicators, and markdown rendering.",
                date: "Feb 01, 2025",
                comments: 5,
                votes: 12,
                expanded: false,
            },
            {
                id: "f4",
                title: "Beta Release",
                status: "planned" as const,
                description: "Initial rollout to 10% of user base.",
                date: "Feb 20, 2025",
                comments: 0,
                votes: 89,
                expanded: false,
            },
        ]
    }

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
                                    <Calendar className="h-4 w-4" /> {roadmap.date}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => toast.success("Link copied to clipboard")}>
                                    <Share2 className="h-4 w-4 mr-2" /> Share
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => toast("More options menu")}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white" onClick={() => toast("Open 'New Feature' modal")}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* Timeline View */}
                    <div className="relative space-y-8 pl-4 md:pl-0">
                        {/* Simple vertical line for mobile */}
                        <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-slate-200 hidden md:block" />

                        {roadmap.features.map((feature, index) => (
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
                                                    onClick={() => toast.success(`Upvoted: ${feature.title}`)}
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-1" /> {feature.votes}
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 mb-4">{feature.description}</p>

                                        {/* Threaded Updates / details */}
                                        {feature.updates && (
                                            <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100 mb-4">
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Updates</h4>
                                                {feature.updates.map((update) => (
                                                    <div key={update.id} className="flex gap-3">
                                                        <Avatar className="h-8 w-8" fallback="SC" />
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
                                            {/* Collapse/Expand could go here if stateful */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Details Panel (Desktop only) */}
            <div className="w-80 border-l border-slate-200 bg-white p-6 hidden xl:block overflow-y-auto">
                <h3 className="font-semibold text-slate-900 mb-4">Roadmap Details</h3>

                <div className="space-y-6">
                    <div>
                        <span className="text-sm text-slate-500 block mb-1">Followers</span>
                        <div className="flex -space-x-2 overflow-hidden mb-2 cursor-pointer" onClick={() => toast("View all followers")}>
                            {[1, 2, 3, 4].map(i => (
                                <Avatar key={i} className="border-2 border-white w-8 h-8" />
                            ))}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs text-slate-500 font-medium">
                                +42
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-sm text-slate-500 block mb-1">Total Votes</span>
                        <span className="text-2xl font-bold text-slate-900">1,248</span>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="font-medium text-slate-900 mb-3">Activity</h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#191a23] shrink-0" />
                                    <p className="text-slate-600">
                                        <span className="font-medium text-slate-900">Sarah</span> updated status to <span className="text-amber-700 bg-[#fffbea] px-1 rounded">In Progress</span> on Backend API.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
