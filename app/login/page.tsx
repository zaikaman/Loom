"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login: email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            toast.success("Logged in successfully!")
            router.push("/dashboard")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Login failed"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-10 w-10 rounded bg-primary mr-3 flex items-center justify-center text-primary-foreground font-bold text-lg">L</div>
                        <span className="text-2xl font-bold text-foreground tracking-tight">Loom</span>
                    </div>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email or Username</label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-[#191a23] hover:bg-[#2a2b35] text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
