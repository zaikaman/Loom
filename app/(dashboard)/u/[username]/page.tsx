import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { searchUsers, getThread, getUser, getMe, ForumsUser, ForumsThread } from "@/lib/forums"
import { getFeedIndexFromCloudinary } from "@/lib/cloudinary"
import { RoadmapCard } from "@/components/RoadmapCard"
import { Button } from "@/components/ui/button"
import { MapIcon, Calendar, User, Mail, Github, Linkedin, Globe, Twitter, Instagram, Facebook } from "lucide-react"
import Link from "next/link"

interface ProfilePageProps {
    params: Promise<{
        username: string
    }>
}

interface FeedIndexExtendedData {
    type: "loom-feed-index"
    publishedRoadmapIds: string[]
}

interface RoadmapExtendedData {
    type?: "roadmap"
    status?: "planned" | "in-progress" | "shipped"
    visibility?: "public" | "private"
    description?: string
    followers?: string[]
    ownerId?: string
    features?: Array<{
        votes: number
    }>
}

async function getProfile(username: string) {
    // 1. Search for the user by username
    const users = await searchUsers(username)
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())
    return user || null
}

async function getUserRoadmaps(userId: string) {
    // 1. Get the global feed index
    const feedIndexId = await getFeedIndexFromCloudinary()
    if (!feedIndexId) return []

    let feedIndex: ForumsThread
    try {
        feedIndex = await getThread(feedIndexId)
    } catch {
        return []
    }

    const indexData = feedIndex.extendedData as FeedIndexExtendedData | undefined
    const publishedIds = indexData?.publishedRoadmapIds || []

    if (publishedIds.length === 0) return []

    // 2. Fetch all published roadmaps
    const roadmapPromises = publishedIds.map(async (id) => {
        try {
            const thread = await getThread(id)
            // Filter by user ID
            const threadUser = (thread as any).user
            if (threadUser?.id !== userId) return null

            const extendedData = thread.extendedData as RoadmapExtendedData | undefined
            const featureCount = extendedData?.features?.length || 0

            // Calculate progress based on status for now (simplified)
            let progress = 0
            const status = extendedData?.status || "planned"
            if (status === "in-progress") progress = 3
            if (status === "shipped") progress = 5

            return {
                id: thread.id,
                title: thread.title,
                description: extendedData?.description || thread.body || "",
                status: status,
                visibility: extendedData?.visibility || "public",
                lastUpdated: thread.updatedAt,
                createdAt: thread.createdAt,
                featureCount,
                progress,
                totalSteps: 5
            }
        } catch {
            return null
        }
    })

    const results = await Promise.all(roadmapPromises)
    const userRoadmaps = results.filter((r): r is NonNullable<typeof r> => r !== null)

    // Sort by most recent
    userRoadmaps.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )

    return userRoadmaps
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params
    const user = await getProfile(username)

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    let currentUserId = null

    if (token) {
        try {
            const me = await getMe(token)
            currentUserId = me.id
        } catch { }
    }

    if (!user) {
        notFound()
    }

    const roadmaps = await getUserRoadmaps(user.id)
    const avatarUrl = (user.extendedData as { avatarUrl?: string })?.avatarUrl

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 flex-shrink-0">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user.username}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#191a23] to-slate-600">
                                <User className="h-10 w-10 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#191a23]">
                            {user.displayName || user.username}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">@{user.username}</p>

                        {user.bio && (
                            <p className="mt-3 text-slate-600 max-w-2xl">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                            {/* Joined Date would be nice if available in API, skipping for now as it wasn't in type */}
                            <div className="flex items-center gap-2">
                                <MapIcon className="h-4 w-4" />
                                <span>{roadmaps.length} Public Roadmaps</span>
                            </div>

                            {currentUserId !== user.id && (
                                <Link href={`/chat/${user.id}`}>
                                    <Button size="sm" variant="outline" className="ml-4 gap-2">
                                        <Mail className="h-4 w-4" />
                                        Message
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Social Links */}
                        {(() => {
                            const socialLinks = (user.extendedData as { socialLinks?: { github?: string; linkedin?: string; twitter?: string; instagram?: string; facebook?: string; website?: string } })?.socialLinks
                            const hasLinks = socialLinks && (socialLinks.github || socialLinks.linkedin || socialLinks.twitter || socialLinks.instagram || socialLinks.facebook || socialLinks.website)
                            if (!hasLinks) return null
                            return (
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    {socialLinks.github && (
                                        <a
                                            href={socialLinks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm"
                                        >
                                            <Github className="h-4 w-4" />
                                            GitHub
                                        </a>
                                    )}
                                    {socialLinks.linkedin && (
                                        <a
                                            href={socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            LinkedIn
                                        </a>
                                    )}
                                    {socialLinks.twitter && (
                                        <a
                                            href={socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            X
                                        </a>
                                    )}
                                    {socialLinks.instagram && (
                                        <a
                                            href={socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors text-sm"
                                        >
                                            <Instagram className="h-4 w-4" />
                                            Instagram
                                        </a>
                                    )}
                                    {socialLinks.facebook && (
                                        <a
                                            href={socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            <Facebook className="h-4 w-4" />
                                            Facebook
                                        </a>
                                    )}
                                    {socialLinks.website && (
                                        <a
                                            href={socialLinks.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Website
                                        </a>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>

            {/* Roadmaps Grid */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[#191a23] mb-6 flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Public Roadmaps
                </h2>

                {roadmaps.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <MapIcon className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-[#191a23] mb-1">No public roadmaps</h3>
                        <p className="text-slate-500">
                            {user.displayName || user.username} hasn't published any roadmaps yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {roadmaps.map((roadmap) => (
                            <RoadmapCard
                                key={roadmap.id}
                                id={roadmap.id}
                                title={roadmap.title}
                                description={roadmap.description}
                                status={roadmap.status as any}
                                lastUpdated={roadmap.lastUpdated}
                                progress={roadmap.progress}
                                totalSteps={roadmap.totalSteps}
                                isPrivate={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
