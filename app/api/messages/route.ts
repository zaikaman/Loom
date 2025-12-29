import { NextRequest, NextResponse } from "next/server";
import { getPrivateMessages, getUser, getMe, ForumsPrivateMessage, ForumsUser } from "@/lib/forums";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current user to know who "me" is
        const me = await getMe(token);

        // Fetch latest messages (limit 100 to cast a wide net for recent conversations)
        // In a real app we might need pagination here too
        const { privateMessages } = await getPrivateMessages(me.id, token);

        // Group by conversation (other participant)
        const conversationsMap = new Map<string, {
            participantId: string;
            lastMessage: ForumsPrivateMessage;
            unreadCount: number;
        }>();

        for (const msg of privateMessages) {
            const isSender = msg.senderId === me.id;
            const otherId = isSender ? msg.recipientId : msg.senderId;

            // Initialize conversation if not exists
            if (!conversationsMap.has(otherId)) {
                conversationsMap.set(otherId, {
                    participantId: otherId,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            const conv = conversationsMap.get(otherId)!;

            // Update last message if this one is newer
            if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
                conv.lastMessage = msg;
            }

            // Count unread messages (received by me and not read)
            if (!isSender && !msg.read) {
                conv.unreadCount++;
            }
        }

        // Fetch user details for each participant
        const conversations = await Promise.all(
            Array.from(conversationsMap.values()).map(async (conv) => {
                try {
                    const user = await getUser(conv.participantId);
                    return {
                        ...conv,
                        participant: user
                    };
                } catch (e) {
                    // If user not found, return partial info or skip
                    return {
                        ...conv,
                        participant: {
                            id: conv.participantId,
                            username: "Unknown User",
                            email: "",
                            displayName: "Unknown User"
                        } as ForumsUser
                    };
                }
            })
        );

        // Sort by last message date desc
        conversations.sort((a, b) =>
            new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
