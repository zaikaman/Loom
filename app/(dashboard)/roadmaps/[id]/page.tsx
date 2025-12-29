"use client"

import { useEffect, useState, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    ArrowRight01Icon,
    Share08Icon,
    MoreHorizontalIcon,
    PlusSignIcon,
    Comment01Icon,
    ThumbsUpIcon,
    Calendar03Icon,
    Loading03Icon,
    Cancel01Icon,
    Globe02Icon,
    PencilEdit01Icon,
    Copy01Icon,
    ViewIcon,
    ViewOffIcon,
    Delete02Icon,
    UserGroup02Icon,
    GithubIcon,
    LinkSquare02Icon,
    BookOpen01Icon,
    Link01Icon,
    SparklesIcon
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { TeamManager } from "@/components/TeamManager"
import confetti from "canvas-confetti"


interface Feature {
    id: string
    title: string
    description: string
    status: "planned" | "in-progress" | "shipped"
    date: string
    votes: number
    hasUpvoted?: boolean
    comments: number
    roadmapId: string
    updates?: { id: string; author: string; date: string; text: string }[]
}

interface Comment {
    id: string
    body: string
    userId: string
    username?: string
    avatarUrl?: string
    createdAt: string
}

interface RoadmapLinks {
    github?: string
    liveDemo?: string
    documentation?: string
    website?: string
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
    author?: {
        username: string
        avatarUrl?: string
    }
    links?: RoadmapLinks
}

export default function RoadmapDetailPage() {
    const params = useParams()
    const router = useRouter()
    const roadmapId = params.id as string
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [features, setFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState(false)
    const [isTeamMember, setIsTeamMember] = useState(false)
    const [userRole, setUserRole] = useState<"owner" | "editor" | "viewer" | null>(null)
    const [showTeamPanel, setShowTeamPanel] = useState(false)

    // Comment state
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
    const [featureComments, setFeatureComments] = useState<Record<string, Comment[]>>({})
    const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())
    const [newComment, setNewComment] = useState<Record<string, string>>({})
    const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set())

    // Feature creation dialog state
    const [showAddFeature, setShowAddFeature] = useState(false)
    const [isCreatingFeature, setIsCreatingFeature] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [newFeature, setNewFeature] = useState({
        title: "",
        description: "",
        status: "planned" as "planned" | "in-progress" | "shipped"
    })

    // Edit Feature state
    const [showEditFeatureModal, setShowEditFeatureModal] = useState(false)
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
    const [editFeatureForm, setEditFeatureForm] = useState({
        title: "",
        description: "",
        status: "planned" as "planned" | "in-progress" | "shipped"
    })
    const [isUpdatingFeature, setIsUpdatingFeature] = useState(false)

    // More options dropdown state
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "planned" as "planned" | "in-progress" | "shipped",
        links: {
            github: "",
            liveDemo: "",
            documentation: "",
            website: ""
        }
    })

    // Feature deletion state
    const [featureToDelete, setFeatureToDelete] = useState<string | null>(null)
    const [isDeletingFeature, setIsDeletingFeature] = useState(false)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMoreOptions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

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
                setIsOwner(roadmapData.isOwner ?? false)
                setIsTeamMember(roadmapData.isTeamMember ?? false)
                setUserRole(roadmapData.userRole ?? null)

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

    const handleCreateFeature = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newFeature.title.trim()) {
            toast.error("Please enter a feature title")
            return
        }

        setIsCreatingFeature(true)

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/features`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newFeature)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create feature")
            }

            // Add the new feature to the list
            const createdFeature: Feature = {
                id: data.feature.id,
                title: data.feature.title,
                description: data.feature.description || "",
                status: data.feature.status,
                date: new Date().toLocaleDateString(),
                votes: 0,
                comments: 0,
                roadmapId,
            }
            setFeatures(prev => [...prev, createdFeature])

            // Reset form and close dialog
            setNewFeature({ title: "", description: "", status: "planned" })
            setShowAddFeature(false)
            toast.success("Feature created successfully!")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create feature"
            toast.error(message)
        } finally {
            setIsCreatingFeature(false)
        }
    }

    const handleEditFeatureClick = (feature: Feature) => {
        setEditingFeature(feature)
        setEditFeatureForm({
            title: feature.title,
            description: feature.description,
            status: feature.status
        })
        setShowEditFeatureModal(true)
    }

    const handleUpdateFeature = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingFeature) return

        if (!editFeatureForm.title.trim()) {
            toast.error("Please enter a feature title")
            return
        }

        setIsUpdatingFeature(true)

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/features`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    featureId: editingFeature.id,
                    ...editFeatureForm
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to update feature")
            }

            // Update local state
            setFeatures(prev => prev.map(f =>
                f.id === editingFeature.id
                    ? { ...f, ...editFeatureForm }
                    : f
            ))

            setShowEditFeatureModal(false)
            toast.success("Feature updated successfully!")

            // Confetti if status changed to shipped
            if (editingFeature.status !== "shipped" && editFeatureForm.status === "shipped") {
                triggerConfetti()
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update feature"
            toast.error(message)
        } finally {
            setIsUpdatingFeature(false)
        }
    }

    const triggerConfetti = () => {
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
        }, 250)
    }

    const handleUpvote = async (featureId: string) => {
        try {
            // Optimistic UI update
            setFeatures(prev => prev.map(f => {
                if (f.id === featureId) {
                    const newHasUpvoted = !f.hasUpvoted
                    return {
                        ...f,
                        votes: newHasUpvoted ? f.votes + 1 : f.votes - 1,
                        hasUpvoted: newHasUpvoted
                    }
                }
                return f
            }))

            const res = await fetch(`/api/roadmaps/${roadmapId}/features`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featureId })
            })

            const data = await res.json()

            if (!res.ok) {
                // Revert optimistic update
                setFeatures(prev => prev.map(f => {
                    if (f.id === featureId) {
                        const revertHasUpvoted = !f.hasUpvoted
                        return {
                            ...f,
                            votes: revertHasUpvoted ? f.votes + 1 : f.votes - 1,
                            hasUpvoted: revertHasUpvoted
                        }
                    }
                    return f
                }))
                throw new Error(data.error || "Failed to upvote")
            }

            // Update with server response
            setFeatures(prev => prev.map(f => {
                if (f.id === featureId) {
                    return {
                        ...f,
                        votes: data.feature.votes,
                        hasUpvoted: data.feature.hasUpvoted
                    }
                }
                return f
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to upvote"
            toast.error(message)
        }
    }

    const toggleComments = async (featureId: string) => {
        const newExpanded = new Set(expandedComments)
        if (newExpanded.has(featureId)) {
            newExpanded.delete(featureId)
        } else {
            newExpanded.add(featureId)
            // Fetch comments if we haven't yet
            if (!featureComments[featureId]) {
                await fetchComments(featureId)
            }
        }
        setExpandedComments(newExpanded)
    }

    const fetchComments = async (featureId: string) => {
        setLoadingComments(prev => new Set(prev).add(featureId))
        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/features/${featureId}/comments`)
            if (res.ok) {
                const data = await res.json()
                setFeatureComments(prev => ({ ...prev, [featureId]: data.comments || [] }))
                // Update comment count
                setFeatures(prev => prev.map(f =>
                    f.id === featureId ? { ...f, comments: (data.comments || []).length } : f
                ))
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err)
        } finally {
            setLoadingComments(prev => {
                const newSet = new Set(prev)
                newSet.delete(featureId)
                return newSet
            })
        }
    }

    const handleSubmitComment = async (featureId: string) => {
        const commentBody = newComment[featureId]?.trim()
        if (!commentBody) return

        setSubmittingComment(prev => new Set(prev).add(featureId))
        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/features/${featureId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: commentBody })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to add comment")
            }

            // Add new comment to the list
            setFeatureComments(prev => ({
                ...prev,
                [featureId]: [...(prev[featureId] || []), data.comment]
            }))

            // Update comment count
            setFeatures(prev => prev.map(f =>
                f.id === featureId ? { ...f, comments: f.comments + 1 } : f
            ))

            // Clear input
            setNewComment(prev => ({ ...prev, [featureId]: "" }))
            toast.success("Comment added!")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to add comment"
            toast.error(message)
        } finally {
            setSubmittingComment(prev => {
                const newSet = new Set(prev)
                newSet.delete(featureId)
                return newSet
            })
        }
    }

    const handlePublishToFeed = async () => {
        try {
            setIsPublishing(true)
            const res = await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roadmapId })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to publish")
            }

            toast.success("Published to community feed! 🎉")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to publish"
            toast.error(message)
        } finally {
            setIsPublishing(false)
        }
    }

    const handleOpenEditModal = () => {
        if (roadmap) {
            setEditForm({
                title: roadmap.title,
                description: roadmap.description || "",
                status: roadmap.status,
                links: {
                    github: roadmap.links?.github || "",
                    liveDemo: roadmap.links?.liveDemo || "",
                    documentation: roadmap.links?.documentation || "",
                    website: roadmap.links?.website || ""
                }
            })
            setShowEditModal(true)
        }
        setShowMoreOptions(false)
    }

    const handleUpdateRoadmap = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editForm.title.trim()) {
            toast.error("Title is required")
            return
        }

        setIsUpdating(true)

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to update roadmap")
            }

            setRoadmap(prev => prev ? { ...prev, ...editForm } : null)
            setShowEditModal(false)
            toast.success("Roadmap updated successfully!")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update roadmap"
            toast.error(message)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDuplicateRoadmap = async () => {
        setShowMoreOptions(false)

        try {
            toast.info("Duplicating roadmap...")

            // Create a new roadmap with the same data
            const res = await fetch("/api/roadmaps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `${roadmap?.title} (Copy)`,
                    description: roadmap?.description || "",
                    status: "planned",
                    visibility: roadmap?.visibility || "private",
                    links: roadmap?.links
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to duplicate roadmap")
            }

            const newRoadmapId = data.roadmap.id

            // Copy features to the new roadmap
            if (features.length > 0) {
                for (const feature of features) {
                    try {
                        await fetch(`/api/roadmaps/${newRoadmapId}/features`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: feature.title,
                                description: feature.description,
                                status: feature.status
                            })
                        })
                    } catch (featureErr) {
                        console.error("Failed to copy feature:", feature.title, featureErr)
                    }
                }
            }

            toast.success("Roadmap duplicated with all features! Redirecting...")
            router.push(`/roadmaps/${newRoadmapId}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to duplicate roadmap"
            toast.error(message)
        }
    }

    const handleToggleVisibility = async () => {
        setShowMoreOptions(false)

        const newVisibility = roadmap?.visibility === "public" ? "private" : "public"

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibility: newVisibility })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to update visibility")
            }

            setRoadmap(prev => prev ? { ...prev, visibility: newVisibility } : null)
            toast.success(`Roadmap is now ${newVisibility}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update visibility"
            toast.error(message)
        }
    }

    const handleDeleteRoadmap = async () => {
        setIsDeleting(true)

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete roadmap")
            }

            toast.success("Roadmap deleted successfully")
            router.push("/roadmaps")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete roadmap"
            toast.error(message)
        } finally {
            setIsDeleting(false)
            setShowDeleteModal(false)
        }
    }

    const handleDeleteFeature = async () => {
        if (!featureToDelete) return

        setIsDeletingFeature(true)

        try {
            const res = await fetch(`/api/roadmaps/${roadmapId}/features/${featureToDelete}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete feature")
            }

            setFeatures(prev => prev.filter(f => f.id !== featureToDelete))
            toast.success("Feature deleted successfully")
            setFeatureToDelete(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete feature"
            toast.error(message)
        } finally {
            setIsDeletingFeature(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
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
            {/* Add Feature Dialog/Modal */}
            {showAddFeature && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Add New Feature</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAddFeature(false)}
                            >
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleCreateFeature} className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Feature Title <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Dark mode support"
                                    value={newFeature.title}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Description</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if (!newFeature.title) {
                                                toast.error("Please enter a title first");
                                                return;
                                            }

                                            // Set loading state if I had one for this specific action, 
                                            // or just use a toast promise which is cleaner
                                            const promise = fetch("/api/ai/expand", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ title: newFeature.title }),
                                            }).then(async (res) => {
                                                if (!res.ok) throw new Error("Failed to generate");
                                                const data = await res.json();
                                                setNewFeature(prev => ({
                                                    ...prev,
                                                    description: prev.description
                                                        ? prev.description + "\n\n" + data.spec
                                                        : data.spec
                                                }));
                                                return data;
                                            });

                                            toast.promise(promise, {
                                                loading: "Generating spec with AI...",
                                                success: "Spec generated!",
                                                error: "Failed to generate spec",
                                            });
                                        }}
                                        className="h-7 text-xs gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                    >
                                        <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" />
                                        Magic Expand
                                    </Button>
                                </div>
                                <textarea
                                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                                    placeholder="Describe this feature..."
                                    value={newFeature.description}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex gap-3">
                                    {(["planned", "in-progress", "shipped"] as const).map((status) => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={newFeature.status === status}
                                                onChange={(e) => setNewFeature(prev => ({
                                                    ...prev,
                                                    status: e.target.value as typeof prev.status
                                                }))}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm capitalize">{status.replace("-", " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddFeature(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                    disabled={isCreatingFeature}
                                >
                                    {isCreatingFeature ? (
                                        <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                    ) : (
                                        "Create Feature"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Feature Modal */}
            {showEditFeatureModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Edit Feature</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowEditFeatureModal(false)}
                            >
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleUpdateFeature} className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Feature Title <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Dark mode support"
                                    value={editFeatureForm.title}
                                    onChange={(e) => setEditFeatureForm(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Description</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if (!editFeatureForm.title) {
                                                toast.error("Please enter a title first");
                                                return;
                                            }

                                            const promise = fetch("/api/ai/expand", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ title: editFeatureForm.title }),
                                            }).then(async (res) => {
                                                if (!res.ok) throw new Error("Failed to generate");
                                                const data = await res.json();
                                                setEditFeatureForm(prev => ({
                                                    ...prev,
                                                    description: prev.description
                                                        ? prev.description + "\n\n" + data.spec
                                                        : data.spec
                                                }));
                                                return data;
                                            });

                                            toast.promise(promise, {
                                                loading: "Generating spec with AI...",
                                                success: "Spec generated!",
                                                error: "Failed to generate spec",
                                            });
                                        }}
                                        className="h-7 text-xs gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                    >
                                        <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" />
                                        Magic Expand
                                    </Button>
                                </div>
                                <textarea
                                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                                    placeholder="Describe this feature..."
                                    value={editFeatureForm.description}
                                    onChange={(e) => setEditFeatureForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex gap-3">
                                    {(["planned", "in-progress", "shipped"] as const).map((status) => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={editFeatureForm.status === status}
                                                onChange={(e) => setEditFeatureForm(prev => ({
                                                    ...prev,
                                                    status: e.target.value as typeof prev.status
                                                }))}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm capitalize">{status.replace("-", " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditFeatureModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                    disabled={isUpdatingFeature}
                                >
                                    {isUpdatingFeature ? (
                                        <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Roadmap Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Edit Roadmap</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowEditModal(false)}
                            >
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleUpdateRoadmap} className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Title <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    placeholder="Roadmap title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Describe this roadmap..."
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex gap-3">
                                    {(["planned", "in-progress", "shipped"] as const).map((status) => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="editStatus"
                                                value={status}
                                                checked={editForm.status === status}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    status: e.target.value as typeof prev.status
                                                }))}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm capitalize">{status.replace("-", " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Project Links Section */}
                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <HugeiconsIcon icon={Link01Icon} className="h-4 w-4 text-slate-400" />
                                    Project Links
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={GithubIcon} className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                        <Input
                                            placeholder="https://github.com/username/repo"
                                            value={editForm.links.github}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                links: { ...prev.links, github: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={LinkSquare02Icon} className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                        <Input
                                            placeholder="https://your-live-demo.com"
                                            value={editForm.links.liveDemo}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                links: { ...prev.links, liveDemo: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                        <Input
                                            placeholder="https://docs.example.com"
                                            value={editForm.links.documentation}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                links: { ...prev.links, documentation: e.target.value }
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                        <Input
                                            placeholder="https://your-website.com"
                                            value={editForm.links.website}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                links: { ...prev.links, website: e.target.value }
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feature Delete Confirmation Modal */}
            {featureToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                                <HugeiconsIcon icon={Delete02Icon} className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-center mb-2">Delete Feature</h2>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Are you sure you want to delete this feature?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setFeatureToDelete(null)}
                                    disabled={isDeletingFeature}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleDeleteFeature}
                                    disabled={isDeletingFeature}
                                >
                                    {isDeletingFeature ? (
                                        <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                                <HugeiconsIcon icon={Delete02Icon} className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-center mb-2">Delete Roadmap</h2>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Are you sure you want to delete <span className="font-medium text-slate-900">&ldquo;{roadmap.title}&rdquo;</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleDeleteRoadmap}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-8 max-w-5xl">
                    {/* Breadcrumb & Header */}
                    {/* Breadcrumb & Header */}
                    <div className="mb-12">
                        <div className="flex items-center text-sm text-slate-500 mb-6">
                            <Link href={isOwner ? "/roadmaps" : "/feed"} className="hover:text-slate-900 transition-colors">
                                {isOwner ? "My Roadmaps" : "Discover"}
                            </Link>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 mx-2 text-slate-300" />
                            <span className="text-slate-900 font-medium truncate max-w-[200px]">{roadmap.title}</span>
                        </div>

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4 max-w-3xl">
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl leading-tight">
                                    {roadmap.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                    {roadmap.author && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/u/${roadmap.author.username}`}>
                                                    <div className="h-5 w-5 rounded-full overflow-hidden border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-slate-200 transition-all">
                                                        {roadmap.author.avatarUrl ? (
                                                            <img
                                                                src={roadmap.author.avatarUrl}
                                                                alt={roadmap.author.username}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-slate-200">
                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                    {roadmap.author.username[0]?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                                <Link href={`/u/${roadmap.author.username}`} className="hover:underline">
                                                    <span className="font-medium text-slate-700">{roadmap.author.username}</span>
                                                </Link>
                                            </div>
                                            <span className="text-slate-300">|</span>
                                        </>
                                    )}
                                    <StatusBadge status={roadmap.status} />
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-1.5">
                                        <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" /> {dateRange}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <Badge variant="secondary" className="font-normal capitalize bg-slate-100 text-slate-600 hover:bg-slate-200">
                                        {roadmap.visibility}
                                    </Badge>
                                </div>

                                {roadmap.description && (
                                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                                        {roadmap.description}
                                    </p>
                                )}

                                {/* Project Links */}
                                {(roadmap.links?.github || roadmap.links?.liveDemo || roadmap.links?.documentation || roadmap.links?.website) && (
                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        {roadmap.links?.github && (
                                            <a
                                                href={roadmap.links.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm"
                                            >
                                                <HugeiconsIcon icon={GithubIcon} className="h-4 w-4" />
                                                GitHub
                                            </a>
                                        )}
                                        {roadmap.links?.liveDemo && (
                                            <a
                                                href={roadmap.links.liveDemo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm"
                                            >
                                                <HugeiconsIcon icon={LinkSquare02Icon} className="h-4 w-4" />
                                                Live Demo
                                            </a>
                                        )}
                                        {roadmap.links?.documentation && (
                                            <a
                                                href={roadmap.links.documentation}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm"
                                            >
                                                <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
                                                Docs
                                            </a>
                                        )}
                                        {roadmap.links?.website && (
                                            <a
                                                href={roadmap.links.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors text-sm"
                                            >
                                                <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                                                Website
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                                {/* Primary Action: Add Feature */}
                                {(isOwner || userRole === "editor") && (
                                    <Button
                                        className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                        onClick={() => setShowAddFeature(true)}
                                    >
                                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" /> Add Feature
                                    </Button>
                                )}

                                {/* Secondary Actions Group */}
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-slate-600 hover:text-slate-900"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            toast.success("Link copied to clipboard")
                                        }}
                                    >
                                        <HugeiconsIcon icon={Share08Icon} className="h-4 w-4 mr-2" /> Share
                                    </Button>

                                    {isTeamMember && (
                                        <>
                                            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 text-slate-600 hover:text-slate-900 ${showTeamPanel ? "bg-slate-100 text-slate-900" : ""}`}
                                                onClick={() => setShowTeamPanel(!showTeamPanel)}
                                            >
                                                <HugeiconsIcon icon={UserGroup02Icon} className="h-4 w-4 mr-2" /> Team
                                            </Button>
                                        </>
                                    )}

                                    {(isOwner || userRole === "editor") && (
                                        <>
                                            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                            <div className="relative" ref={dropdownRef}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 px-0 text-slate-600 hover:text-slate-900"
                                                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                                                >
                                                    <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                                </Button>

                                                {/* Dropdown Menu */}
                                                {showMoreOptions && (
                                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl z-50 p-1 animate-in fade-in-0 zoom-in-95">
                                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                            Management
                                                        </div>

                                                        {isOwner && (
                                                            <button
                                                                onClick={handlePublishToFeed}
                                                                disabled={isPublishing}
                                                                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
                                                            >
                                                                {isPublishing ? <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" /> : <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4 text-slate-500" />}
                                                                Publish to Community
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={handleOpenEditModal}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                                                        >
                                                            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-slate-500" />
                                                            Edit Details
                                                        </button>

                                                        <button
                                                            onClick={handleDuplicateRoadmap}
                                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                                                        >
                                                            <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 text-slate-500" />
                                                            Duplicate
                                                        </button>

                                                        {isOwner && (
                                                            <button
                                                                onClick={handleToggleVisibility}
                                                                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                                                            >
                                                                {roadmap.visibility === "public" ? (
                                                                    <>
                                                                        <HugeiconsIcon icon={ViewOffIcon} className="h-4 w-4 text-slate-500" /> Make Private
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 text-slate-500" /> Make Public
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        {isOwner && (
                                                            <>
                                                                <div className="my-1 border-t border-slate-100" />

                                                                <button
                                                                    onClick={() => {
                                                                        setShowMoreOptions(false)
                                                                        setShowDeleteModal(true)
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                >
                                                                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                                                    Delete Roadmap
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Team Panel (collapsible) */}
                        {showTeamPanel && isTeamMember && (
                            <div className="mt-8 animate-in slide-in-from-top-2 fade-in duration-200">
                                <TeamManager
                                    roadmapId={roadmapId}
                                    isOwner={isOwner}
                                    onClose={() => setShowTeamPanel(false)}
                                />
                            </div>
                        )}
                    </div>

                    <Separator className="mb-12" />

                    {/* Timeline View */}
                    {features.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <HugeiconsIcon icon={PlusSignIcon} className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No features yet</h3>
                            <p className="text-slate-500 mb-4">
                                {(isOwner || userRole === "editor") ? "Add your first feature to this roadmap." : "This roadmap doesn't have any features yet."}
                            </p>
                            {(isOwner || userRole === "editor") && (
                                <Button
                                    className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                    onClick={() => setShowAddFeature(true)}
                                >
                                    <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" /> Add Feature
                                </Button>
                            )}
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
                                                        className={`${feature.hasUpvoted ? 'text-[#191a23] bg-slate-100' : 'text-slate-500'} hover:text-[#191a23]`}
                                                        onClick={() => handleUpvote(feature.id)}
                                                    >
                                                        <HugeiconsIcon icon={ThumbsUpIcon} className={`h-4 w-4 mr-1 ${feature.hasUpvoted ? 'fill-current' : ''}`} /> {feature.votes}
                                                    </Button>

                                                    {(isOwner || userRole === "editor") && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-slate-400 hover:text-slate-900"
                                                                onClick={() => handleEditFeatureClick(feature)}
                                                            >
                                                                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-slate-400 hover:text-red-600"
                                                                onClick={() => setFeatureToDelete(feature.id)}
                                                            >
                                                                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-slate-600 mb-4 whitespace-pre-wrap">{feature.description}</p>

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

                                            <div className="pt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-black hover:bg-secondary -ml-2"
                                                    onClick={() => toggleComments(feature.id)}
                                                >
                                                    <HugeiconsIcon icon={Comment01Icon} className="h-4 w-4 mr-2" />
                                                    {feature.comments} Comments
                                                    {expandedComments.has(feature.id) ? " ▲" : " ▼"}
                                                </Button>

                                                {/* Expandable Comment Section */}
                                                {expandedComments.has(feature.id) && (
                                                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-4">
                                                        {loadingComments.has(feature.id) ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <HugeiconsIcon icon={Loading03Icon} className="h-5 w-5 animate-spin text-slate-400" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Comment List */}
                                                                {(featureComments[feature.id] || []).length === 0 ? (
                                                                    <p className="text-sm text-slate-500 text-center py-2">
                                                                        No comments yet. Be the first to comment!
                                                                    </p>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {(featureComments[feature.id] || []).map((comment) => (
                                                                            <div key={comment.id} className="flex gap-3">
                                                                                <Link href={`/u/${comment.username}`}>
                                                                                    <Avatar
                                                                                        src={comment.avatarUrl}
                                                                                        className="h-8 w-8 hover:ring-2 hover:ring-slate-200 transition-all"
                                                                                        fallback={(comment.username || "U")[0]}
                                                                                    />
                                                                                </Link>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <Link href={`/u/${comment.username}`} className="hover:underline">
                                                                                            <span className="text-sm font-medium text-slate-900">
                                                                                                {comment.username || "User"}
                                                                                            </span>
                                                                                        </Link>
                                                                                        <span className="text-xs text-slate-400">
                                                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-sm text-slate-600">{comment.body}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* New Comment Form */}
                                                                <div className="flex gap-2 pt-2 border-t border-slate-200">
                                                                    <Input
                                                                        placeholder="Add a comment..."
                                                                        value={newComment[feature.id] || ""}
                                                                        onChange={(e) => setNewComment(prev => ({
                                                                            ...prev,
                                                                            [feature.id]: e.target.value
                                                                        }))}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                                e.preventDefault()
                                                                                handleSubmitComment(feature.id)
                                                                            }
                                                                        }}
                                                                        disabled={submittingComment.has(feature.id)}
                                                                        className="flex-1"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                                                        onClick={() => handleSubmitComment(feature.id)}
                                                                        disabled={submittingComment.has(feature.id) || !newComment[feature.id]?.trim()}
                                                                    >
                                                                        {submittingComment.has(feature.id) ? (
                                                                            <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            "Post"
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
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

                    {/* Project Links in Sidebar */}
                    {(roadmap.links?.github || roadmap.links?.liveDemo || roadmap.links?.documentation || roadmap.links?.website) && (
                        <>
                            <div>
                                <h4 className="font-medium text-slate-900 mb-3">Project Links</h4>
                                <div className="space-y-2">
                                    {roadmap.links?.github && (
                                        <a
                                            href={roadmap.links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            <HugeiconsIcon icon={GithubIcon} className="h-4 w-4" />
                                            <span className="truncate">{roadmap.links.github.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                    {roadmap.links?.liveDemo && (
                                        <a
                                            href={roadmap.links.liveDemo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            <HugeiconsIcon icon={LinkSquare02Icon} className="h-4 w-4" />
                                            <span className="truncate">{roadmap.links.liveDemo.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                    {roadmap.links?.documentation && (
                                        <a
                                            href={roadmap.links.documentation}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
                                            <span className="truncate">{roadmap.links.documentation.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                    {roadmap.links?.website && (
                                        <a
                                            href={roadmap.links.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                                            <span className="truncate">{roadmap.links.website.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

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
