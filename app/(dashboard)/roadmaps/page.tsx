"use client"

import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoadmapCard } from "@/components/RoadmapCard"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useState } from "react"

// Extended dummy data
const initialRoadmaps = [
    {
        id: "1",
        title: "AI Chat Feature",
        description: "Integrating LLM capabilities into the core message handling system.",
        status: "in-progress" as const,
        lastUpdated: "Today",
        progress: 3,
        totalSteps: 5,
        isPrivate: false,
    },
    {
        id: "2",
        title: "Mobile Responsive Redesign",
        description: "Complete overhaul of the mobile viewport experience.",
        status: "planned" as const,
        lastUpdated: "Yesterday",
        progress: 0,
        totalSteps: 4,
        isPrivate: true,
    },
    {
        id: "3",
        title: "Q3 Marketing Launch",
        description: "Landing page updates and email campaign coordination.",
        status: "shipped" as const,
        lastUpdated: "3 days ago",
        progress: 5,
        totalSteps: 5,
        isPrivate: false,
    },
    {
        id: "4",
        title: "API V2 Migration",
        description: "Transitioning legacy endpoints to the new GraphQL schema.",
        status: "in-progress" as const,
        lastUpdated: "1 week ago",
        progress: 2,
        totalSteps: 6,
        isPrivate: true,
    },
    {
        id: "5",
        title: "Dark Mode Support",
        description: "Implementing system-wide dark mode theme.",
        status: "planned" as const,
        lastUpdated: "2 weeks ago",
        progress: 0,
        totalSteps: 3,
        isPrivate: false,
    },
    {
        id: "6",
        title: "User Analytics Dashboard",
        description: "New analytics view for admin users.",
        status: "shipped" as const,
        lastUpdated: "1 month ago",
        progress: 4,
        totalSteps: 4,
        isPrivate: true,
    },
]

export default function RoadmapsPage() {
    const [filter, setFilter] = useState("all")

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Roadmaps</h1>
                    <p className="text-slate-500 mt-1">Manage and track all your product initiatives.</p>
                </div>
                <Link href="/roadmaps/new">
                    <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-1">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search roadmaps..." className="pl-10" onChange={() => toast("Search is mocked")} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 border-dashed" onClick={() => toast("Advanced filters modal")}>
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Badge
                        variant={filter === "all" ? "default" : "secondary"}
                        className="px-3 py-1 cursor-pointer hover:bg-slate-200"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Badge>
                    <Badge
                        variant={filter === "active" ? "default" : "outline"}
                        className="px-3 py-1 cursor-pointer hover:bg-slate-50"
                        onClick={() => setFilter("active")}
                    >
                        Active
                    </Badge>
                    <Badge
                        variant={filter === "private" ? "default" : "outline"}
                        className="px-3 py-1 cursor-pointer hover:bg-slate-50"
                        onClick={() => setFilter("private")}
                    >
                        Private
                    </Badge>
                    <Badge
                        variant={filter === "public" ? "default" : "outline"}
                        className="px-3 py-1 cursor-pointer hover:bg-slate-50"
                        onClick={() => setFilter("public")}
                    >
                        Public
                    </Badge>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {initialRoadmaps.map((roadmap) => (
                    <RoadmapCard
                        key={roadmap.id}
                        {...roadmap}
                    />
                ))}
            </div>
        </div>
    )
}
