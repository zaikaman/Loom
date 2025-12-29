"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, MoreVertical, Phone, Video, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Skeleton } from "../../../../components/ui/skeleton" // Will fix if missing

interface Message {
    id: string
    body: string
    senderId: string
    recipientId: string
    createdAt: string
    read: boolean
}

interface User {
    id: string
    username: string
    displayName?: string
    extendedData?: {
        avatarUrl?: string
    }
}

export default function ChatDetailPage() {
    const params = useParams()
    const router = useRouter()
    const recipientId = params.recipientId as string

    const [messages, setMessages] = useState<Message[]>([])
    const [recipient, setRecipient] = useState<User | null>(null)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Fetch current user and recipient info
        async function init() {
            try {
                const [meRes, recipientRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch(`/api/users/${recipientId}`) // We need a way to get user info. 
                    // Actually, getting user info by ID might need a specific endpoint or we use search if ID lookup isn't direct.
                    // Foru.ms API has getUser(id), we should make an API route for it or reuse existing.
                    // Let's assume we can fetch user profile via our own API or we need to create one.
                    // Existing route /api/auth/me is for self.
                    // Let's use the one we created or rely on the messages endpoint to give us info?
                    // The messages endpoint currently filters.
                    // Let's try to fetch user details. API route for user details is needed.
                ])

                if (meRes.ok) {
                    const data = await meRes.json()
                    setCurrentUser(data.user)
                }

                // Temporary: fetch recipient from a new endpoint or existing. 
                // We don't have a direct /api/users/[id] endpoint in our `app/api` folder yet?
                // `app/api/profile` exists?
                // Let's assume we can get it or we will implement a helper in the `useEffect` to fetch it via `search` or something.
                // For now, let's fetch messages first, maybe we can infer or if we lack it, we show "User".
                // Actually, let's add a backend route to get user details: `app/api/users/[id]/route.ts` is useful.

                // Fetch messages
                const msgRes = await fetch(`/api/messages/${recipientId}`)
                if (msgRes.ok) {
                    const data = await msgRes.json()
                    setMessages(data.messages || [])
                }

                // Hack request to get user info if we don't have a dedicated route yet. 
                // We'll create `app/api/users/[id]/route.ts` shortly to support this.
                const userRes = await fetch(`/api/users/${recipientId}`)
                if (userRes.ok) {
                    const data = await userRes.json()
                    setRecipient(data.user)
                } else {
                    // Fallback if route doesn't exist yet
                    setRecipient({ id: recipientId, username: "User" })
                }

            } catch (error) {
                console.error("Error initializing chat", error)
            } finally {
                setLoading(false)
            }
        }

        init()

        // Poll for new messages every 5 seconds
        const interval = setInterval(async () => {
            if (!recipientId) return
            try {
                const res = await fetch(`/api/messages/${recipientId}`)
                if (res.ok) {
                    const data = await res.json()
                    const newMessages = data.messages || [] as Message[]

                    setMessages(prev => {
                        // Check if we have new messages from the other person
                        const lastMsgId = prev.length > 0 ? prev[prev.length - 1].id : null
                        const hasNew = newMessages.length > prev.length &&
                            newMessages[newMessages.length - 1].senderId === recipientId &&
                            newMessages[newMessages.length - 1].id !== lastMsgId

                        if (hasNew) {
                            // Play notification sound
                            try {
                                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
                                audio.volume = 0.5
                                audio.play().catch(e => console.error("Audio play failed", e))
                            } catch (e) {
                                console.error("Audio init failed", e)
                            }
                        }
                        return newMessages
                    })
                }
            } catch (e) {
                console.error("Polling error", e)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [recipientId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        const tempId = Date.now().toString()
        const optimisticMessage: Message = {
            id: tempId,
            body: newMessage,
            senderId: currentUser.id,
            recipientId: recipientId,
            createdAt: new Date().toISOString(),
            read: false
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage("")
        setSending(true)

        try {
            const res = await fetch(`/api/messages/${recipientId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: optimisticMessage.body })
            })

            if (!res.ok) {
                throw new Error("Failed to send")
            }

            // Refresh messages to get the real ID and timestamp
            const data = await res.json()
            // Optional: replace optimistic message with real one
            const msgRes = await fetch(`/api/messages/${recipientId}`)
            if (msgRes.ok) {
                const data = await msgRes.json()
                setMessages(data.messages || [])
            }
        } catch (error) {
            console.error("Failed to send message", error)
            // Rollback optimistic update
            setMessages(prev => prev.filter(m => m.id !== tempId))
            // Show error toast
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh)] bg-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <Link
                        href="/chat"
                        className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={recipient?.extendedData?.avatarUrl}
                                fallback={recipient?.displayName?.[0] || recipient?.username?.[0] || "?"}
                                className="h-10 w-10 border border-slate-200"
                            />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 leading-none">
                                    {recipient?.displayName || recipient?.username || "Unknown User"}
                                </h3>
                                <span className="text-xs text-slate-500">
                                    @{recipient?.username}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                    <Button variant="ghost" size="icon" className="hover:text-slate-900">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-slate-900">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-slate-900">
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {loading ? (
                    <div className="space-y-6 pt-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={cn("flex gap-2 max-w-[80%]", i % 2 === 0 ? "ml-auto flex-row-reverse" : "")}>
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-12 w-32 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-slate-400 ml-1" />
                        </div>
                        <p className="text-slate-500">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser?.id
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId)

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full mb-2",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex max-w-[70%] md:max-w-[60%] items-end gap-2",
                                    isMe ? "flex-row-reverse" : "flex-row"
                                )}>
                                    {!isMe && (
                                        <div className="w-8 shrink-0">
                                            {showAvatar && (
                                                <Avatar
                                                    src={recipient?.extendedData?.avatarUrl}
                                                    fallback={recipient?.displayName?.[0] || recipient?.username[0]}
                                                    className="h-8 w-8 border border-slate-200"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl shadow-sm text-sm break-words",
                                        isMe
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                                    )}>
                                        {msg.body}
                                    </div>

                                    <span className="text-[10px] text-slate-400 shrink-0 mb-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 max-w-4xl mx-auto"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-full px-4"
                        disabled={sending}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || sending}
                        className={cn(
                            "rounded-full h-10 w-10 shrink-0 transition-all",
                            newMessage.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 text-slate-400"
                        )}
                    >
                        <Send className="h-4 w-4 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
