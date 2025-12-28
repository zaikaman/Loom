"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutGrid, TrendingUp, Users, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoadmapCard } from "@/components/RoadmapCard"

interface Roadmap {
    id: string
    title: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    visibility: "public" | "private"
    lastUpdated: string
    featureCount: number
}

interface User {
    id: string
    username: string
    displayName?: string
    email: string
}

export default function DashboardPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)

                // Fetch user info and roadmaps in parallel
                const [userRes, roadmapsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/roadmaps")
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (roadmapsRes.ok) {
                    const roadmapsData = await roadmapsRes.json()
                    setRoadmaps(roadmapsData.roadmaps || [])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const stats = [
        {
            title: "Total Roadmaps",
            value: roadmaps.length.toString(),
            icon: LayoutGrid,
            change: "All time"
        },
        {
            title: "Active Features",
            value: roadmaps.reduce((acc, r) => acc + (r.featureCount || 0), 0).toString(),
            icon: TrendingUp,
            change: "Across roadmaps"
        },
        {
            title: "Team Members",
            value: "1",
            icon: Users,
            change: "You"
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back{user?.displayName ? `, ${user.displayName}` : ""}!
                    </h1>
                    <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your roadmaps.</p>
                </div>
                <Link href="/roadmaps/new">
                    <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                {stats.map((stat, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Roadmaps */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Recent Roadmaps</h2>
                    <Link href="/roadmaps" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        View All →
                    </Link>
                </div>

                {roadmaps.length === 0 ? (
                    <Card className="p-8">
                        <div className="text-center">
                            <LayoutGrid className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No roadmaps yet</h3>
                            <p className="text-slate-500 mb-4">Create your first roadmap to get started.</p>
                            <Link href="/roadmaps/new">
                                <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Create Roadmap
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {roadmaps.slice(0, 3).map((roadmap) => (
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
        </div>
    )
}
