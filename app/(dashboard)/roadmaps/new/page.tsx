"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function NewRoadmapPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        visibility: "public"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Please enter a roadmap title")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch("/api/roadmaps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create roadmap")
            }

            toast.success("Roadmap created successfully!")
            router.push(`/roadmaps/${data.roadmap.id}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create roadmap"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/roadmaps"
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4 mr-1" />
                Back to Roadmaps
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Roadmap</CardTitle>
                    <CardDescription>
                        Start a new product roadmap to track your features and updates.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                Roadmap Title <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="title"
                                placeholder="e.g., Q1 Product Launch"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="description"
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                                placeholder="What is this roadmap about?"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        {/* Visibility */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Visibility</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={formData.visibility === "public"}
                                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <span className="text-sm">Public</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={formData.visibility === "private"}
                                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <span className="text-sm">Private</span>
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formData.visibility === "public"
                                    ? "Anyone with the link can view this roadmap."
                                    : "Only you and your team can view this roadmap."}
                            </p>
                        </div>
                    </CardContent>
                    <div className="flex items-center justify-end gap-4 p-6 pt-0">
                        <Link href="/roadmaps">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                            ) : (
                                "Create Roadmap"
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
