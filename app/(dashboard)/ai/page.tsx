// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
// Removed useChat to avoid "ai" SDK dependencies/errors
import { SentIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface UserInfo {
    id: string;
    username: string;
    displayName?: string;
    extendedData?: {
        avatarUrl?: string;
    };
}

export default function LoomAIPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);

    // Fetch user for avatar
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (e) {
                console.error("Failed to fetch user", e);
            }
        }
        fetchUser();
    }, []);

    // Auto-scroll to bottom of chat
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
        e?.preventDefault();
        const promptToUse = customPrompt || input;
        if (!promptToUse.trim() || isLoading) return;

        // 1. Add User Message
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: promptToUse };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // 2. Call API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) throw new Error(response.statusText);
            if (!response.body) return;

            // 3. Create placeholder for AI response
            const aiMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

            // 4. Stream Reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: accumulatedContent } : m
                ));
            }

        } catch (error) {
            console.error("Chat error:", error);
            // Optionally add an error message to the chat
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 h-[calc(100vh-4rem)] flex flex-col max-w-5xl bg-white text-slate-900">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-900 rounded-lg">
                    <HugeiconsIcon icon={SparklesIcon} className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Loom AI</h1>
                    <p className="text-slate-500">
                        Your intelligent roadmap assistant.
                    </p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                <HugeiconsIcon icon={SparklesIcon} className="h-8 w-8 text-slate-900" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    How can I help you today?
                                </h3>
                                <p className="text-slate-500">
                                    I analyze your roadmaps to help you prioritize features, draft updates, and uncover insights.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                                {[
                                    "Summarize my roadmaps",
                                    "What features should I build next?",
                                    "Draft a changelog for shipped features",
                                    "Find duplicate feature requests",
                                ].map((q) => (
                                    <Button
                                        key={q}
                                        variant="outline"
                                        className="h-auto py-4 px-6 justify-start text-left text-sm font-medium hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900"
                                        onClick={() => handleSubmit(undefined, q)}
                                    >
                                        {q}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row max-w-3xl"}`}
                                >
                                    <Avatar
                                        className={`h-10 w-10 border border-slate-200 ${m.role === "user" ? "bg-slate-100" : "bg-slate-900"}`}
                                        src={m.role === "user" ? user?.extendedData?.avatarUrl : undefined}
                                        fallback={
                                            <span className={m.role === "user" ? "text-slate-600" : "text-white"}>
                                                {m.role === "user" ? (user?.displayName?.[0] || "U") : <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />}
                                            </span>
                                        }
                                    />

                                    <div
                                        className={`flex flex-col gap-1 min-w-0 ${m.role === "user" ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`rounded-2xl px-6 py-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${m.role === "user"
                                                ? "bg-slate-900 text-white rounded-tr-none border-slate-900"
                                                : "bg-white text-slate-800 rounded-tl-none border-slate-200"
                                                }`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex gap-4 max-w-3xl">
                                    <Avatar className="h-10 w-10 border border-slate-200 bg-slate-900" fallback={<HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 text-white" />} />
                                    <div className="bg-white border boundary-slate-200 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-1.5 h-[54px]">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto relative flex items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="Ask me anything about your product..."
                            className="pr-12 py-6 text-base rounded-full border-slate-200 shadow-sm focus-visible:ring-slate-900 placeholder:text-slate-400 text-slate-900 bg-white"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="absolute right-2 h-9 w-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
