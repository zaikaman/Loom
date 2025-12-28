import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoadmapCard } from "@/components/RoadmapCard"

// Dummy data
const stats = [
    { label: "Total Roadmaps", value: "12" },
    { label: "Shipped Features", value: "48" },
    { label: "Total Followers", value: "1.2k" },
    { label: "Last Activity", value: "2h ago" },
]

const recentRoadmaps = [
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
]

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <Link href="/roadmaps/new">
                    <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create New Roadmap
                    </Button>
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {stat.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Roadmaps */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Recent Roadmaps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {recentRoadmaps.map((roadmap) => (
                    <RoadmapCard
                        key={roadmap.id}
                        {...roadmap}
                    />
                ))}
            </div>
        </div>
    )
}
