"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Mail, Camera } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const handleSave = () => {
        toast.success("Profile updated successfully!")
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your public profile and account settings.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Header / Avatar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Public Avatar</CardTitle>
                        <CardDescription>This is your public display picture.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-sm" src="https://github.com/shadcn.png" />
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-fit" onClick={() => toast.info("Image upload mocked")}>
                                <Camera className="mr-2 h-4 w-4" /> Change Avatar
                            </Button>
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="name" placeholder="John Doe" defaultValue="John Doe" className="pl-10" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" className="pl-10" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="bio" className="text-sm font-medium leading-none">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                placeholder="Tell us a little about yourself"
                                defaultValue="Product Manager at Loom."
                            />
                        </div>
                    </CardContent>
                    <div className="flex items-center p-6 pt-0">
                        <Button className="bg-[#191a23] hover:bg-[#2a2b35] text-white" onClick={handleSave}>Save Changes</Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
