"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewRoadmapPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast.success("Roadmap created successfully!")
        setIsLoading(false)
        router.push("/roadmaps")
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-2xl">
            <Link href="/roadmaps" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 w-fit transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmaps
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Roadmap</CardTitle>
                    <CardDescription>Start a new product roadmap to share with your users.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none">Roadmap Name</label>
                            <Input id="name" placeholder="e.g. Q4 2024 Product Plan" required />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="desc" className="text-sm font-medium leading-none">Description</label>
                            <textarea
                                id="desc"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Briefly describe what this roadmap tracks..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Visibility</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm border p-3 rounded-md cursor-pointer hover:bg-secondary/50 w-full transition-colors">
                                    <input type="radio" name="visibility" value="public" defaultChecked className="accent-primary" />
                                    <div>
                                        <span className="font-medium block">Public</span>
                                        <span className="text-xs text-muted-foreground">Visible to everyone</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 text-sm border p-3 rounded-md cursor-pointer hover:bg-secondary/50 w-full transition-colors">
                                    <input type="radio" name="visibility" value="private" className="accent-primary" />
                                    <div>
                                        <span className="font-medium block">Private</span>
                                        <span className="text-xs text-muted-foreground">Only team members</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t border-border bg-secondary/10 px-6 py-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#191a23] hover:bg-[#2a2b35] text-white">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Roadmap"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
