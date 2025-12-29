"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MessageCircle, MoreVertical, CheckCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
// import { Heading } from "@/components/Heading" // Assuming this exists, based on file list
import { Skeleton } from "../../../components/ui/skeleton"

interface Conversation {
    participantId: string
    participant: {
        id: string
        username: string
        displayName?: string
        extendedData?: {
            avatarUrl?: string
        }
    }
    lastMessage: {
        id: string
        body: string
        createdAt: string
        read: boolean
        senderId: string
    }
    unreadCount: number
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchConversations() {
            try {
                const res = await fetch("/api/messages")
                if (res.ok) {
                    const data = await res.json()
                    setConversations(data.conversations || [])
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error)
            } finally {
                setLoading(false)
            }
        }
        fetchConversations()
    }, [])

    const filteredConversations = conversations.filter(c => {
        const query = searchQuery.toLowerCase()
        return (
            c.participant.displayName?.toLowerCase().includes(query) ||
            c.participant.username.toLowerCase().includes(query)
        )
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex flex-col space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Messages</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-10 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No messages yet</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                            Start a conversation by visiting a user's profile and clicking the Message button.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {filteredConversations.map((conv) => (
                            <Link
                                key={conv.participantId}
                                href={`/chat/${conv.participantId}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="relative">
                                    <Avatar
                                        src={conv.participant.extendedData?.avatarUrl}
                                        fallback={conv.participant.displayName?.[0] || conv.participant.username[0]}
                                        className="h-12 w-12 border border-slate-200"
                                    />
                                    {/* Online indicator could go here */}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-semibold text-slate-900 truncate pr-2">
                                            {conv.participant.displayName || conv.participant.username}
                                        </h4>
                                        <span className={cn(
                                            "text-xs whitespace-nowrap",
                                            conv.unreadCount > 0 ? "text-blue-600 font-medium" : "text-slate-500"
                                        )}>
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "text-sm truncate pr-4",
                                            conv.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"
                                        )}>
                                            {conv.lastMessage.senderId !== conv.participantId && <span className="mr-1">You:</span>}
                                            {conv.lastMessage.body}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-2 ring-white">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
