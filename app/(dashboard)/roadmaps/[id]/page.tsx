"use client"

import { useEffect, useState, useRef } from "react"
import {
    ChevronRight,
    Share2,
    MoreHorizontal,
    Plus,
    MessageSquare,
    ThumbsUp,
    Calendar,
    Loader2,
    X,
    Globe,
    Pencil,
    Copy,
    Eye,
    EyeOff,
    Trash2
} from "lucide-react"
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
    createdAt: string
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
    const router = useRouter()
    const roadmapId = params.id as string
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [features, setFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState(false)

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

    // More options dropdown state
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "planned" as "planned" | "in-progress" | "shipped"
    })

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
                status: roadmap.status
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
            // Create a new roadmap with the same data
            const res = await fetch("/api/roadmaps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `${roadmap?.title} (Copy)`,
                    description: roadmap?.description || "",
                    status: "planned",
                    visibility: roadmap?.visibility || "private"
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to duplicate roadmap")
            }

            toast.success("Roadmap duplicated! Redirecting...")
            router.push(`/roadmaps/${data.roadmap.id}`)
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
                                <X className="h-4 w-4" />
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
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                    ) : (
                                        "Create Feature"
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
                                <X className="h-4 w-4" />
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
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
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
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
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
                    <div className="mb-8">
                        <div className="flex items-center text-sm text-slate-500 mb-4">
                            <Link href={isOwner ? "/roadmaps" : "/feed"} className="hover:text-slate-900 transition-colors">
                                {isOwner ? "My Roadmaps" : "Discover"}
                            </Link>
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
                                {isOwner && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePublishToFeed}
                                            disabled={isPublishing}
                                        >
                                            {isPublishing ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Globe className="h-4 w-4 mr-2" />
                                            )}
                                            Publish
                                        </Button>
                                        <div className="relative" ref={dropdownRef}>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setShowMoreOptions(!showMoreOptions)}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>

                                            {/* Dropdown Menu */}
                                            {showMoreOptions && (
                                                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
                                                    <button
                                                        onClick={handleOpenEditModal}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4 text-slate-500" />
                                                        Edit Roadmap
                                                    </button>
                                                    <button
                                                        onClick={handleDuplicateRoadmap}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Copy className="h-4 w-4 text-slate-500" />
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        onClick={handleToggleVisibility}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                    >
                                                        {roadmap.visibility === "public" ? (
                                                            <>
                                                                <EyeOff className="h-4 w-4 text-slate-500" />
                                                                Make Private
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4 text-slate-500" />
                                                                Make Public
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className="my-1 border-t border-slate-100" />
                                                    <button
                                                        onClick={() => {
                                                            setShowMoreOptions(false)
                                                            setShowDeleteModal(true)
                                                        }}
                                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Roadmap
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                            onClick={() => setShowAddFeature(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Feature
                                        </Button>
                                    </>
                                )}
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
                            <p className="text-slate-500 mb-4">
                                {isOwner ? "Add your first feature to this roadmap." : "This roadmap doesn't have any features yet."}
                            </p>
                            {isOwner && (
                                <Button
                                    className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                                    onClick={() => setShowAddFeature(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Feature
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
                                                        <ThumbsUp className={`h-4 w-4 mr-1 ${feature.hasUpvoted ? 'fill-current' : ''}`} /> {feature.votes}
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

                                            <div className="pt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-black hover:bg-secondary -ml-2"
                                                    onClick={() => toggleComments(feature.id)}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    {feature.comments} Comments
                                                    {expandedComments.has(feature.id) ? " ▲" : " ▼"}
                                                </Button>

                                                {/* Expandable Comment Section */}
                                                {expandedComments.has(feature.id) && (
                                                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-4">
                                                        {loadingComments.has(feature.id) ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
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
                                                                                <Avatar className="h-8 w-8" fallback={(comment.username || "U")[0]} />
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <span className="text-sm font-medium text-slate-900">
                                                                                            {comment.username || "User"}
                                                                                        </span>
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
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
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
