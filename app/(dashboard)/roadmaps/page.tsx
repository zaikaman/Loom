"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Search01Icon, FilterHorizontalIcon, Loading03Icon, DashboardSquare02Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoadmapCard } from "@/components/RoadmapCard"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Roadmap {
    id: string
    title: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    visibility: "public" | "private"
    lastUpdated: string
    featureCount: number
}

export default function RoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchRoadmaps() {
            try {
                setIsLoading(true)
                const res = await fetch("/api/roadmaps")

                if (!res.ok) {
                    throw new Error("Failed to fetch roadmaps")
                }

                const data = await res.json()
                setRoadmaps(data.roadmaps || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRoadmaps()
    }, [])

    // Filter roadmaps based on current filter and search
    const filteredRoadmaps = roadmaps.filter((roadmap) => {
        if (searchQuery && !roadmap.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }

        switch (filter) {
            case "active":
                return roadmap.status === "in-progress"
            case "private":
                return roadmap.visibility === "private"
            case "public":
                return roadmap.visibility === "public"
            default:
                return true
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        )
    }

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
                        <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 p-1">
                <div className="relative w-full md:w-96">
                    <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search roadmaps..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 border-dashed"
                        onClick={() => toast("Advanced filters coming soon")}
                    >
                        <HugeiconsIcon icon={FilterHorizontalIcon} className="mr-2 h-4 w-4" /> Filter
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
            {filteredRoadmaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <HugeiconsIcon icon={DashboardSquare02Icon} className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {searchQuery || filter !== "all" ? "No matching roadmaps" : "No roadmaps yet"}
                    </h3>
                    <p className="text-slate-500 mb-4">
                        {searchQuery || filter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Create your first roadmap to get started."}
                    </p>
                    {!searchQuery && filter === "all" && (
                        <Link href="/roadmaps/new">
                            <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                                <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" /> Create Roadmap
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredRoadmaps.map((roadmap) => (
                        <RoadmapCard
                            key={roadmap.id}
                            id={roadmap.id}
                            title={roadmap.title}
                            description={roadmap.description}
                            status={roadmap.status}
                            lastUpdated={roadmap.lastUpdated}
                            progress={roadmap.status === "shipped" ? 5 : roadmap.status === "in-progress" ? 3 : 0}
                            totalSteps={5}
                            isPrivate={roadmap.visibility === "private"}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
