import { NextRequest, NextResponse } from "next/server";
import { getPrivateMessages, sendPrivateMessage, getMe, getUser, updatePrivateMessage } from "@/lib/forums";
import { getSession } from "@/lib/session";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ recipientId: string }> }
) {
    try {
        const { recipientId } = await params;
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const me = await getMe(token);
        // console.log("DEBUG: GET /api/messages/[recipientId] - Me:", me?.id);

        // Fetch all messages
        // Optimization: In a real world scenario, we'd want an endpoint to fetch messages by conversation
        // or thread ID. Since we are simulating chat on top of PMs, we filter client-side (server-side here).
        const { privateMessages } = await getPrivateMessages(me.id, token);

        // Filter for conversation with this recipient
        const messages = privateMessages.filter(msg =>
            (msg.senderId === me.id && msg.recipientId === recipientId) ||
            (msg.senderId === recipientId && msg.recipientId === me.id)
        );

        // Sort by date (oldest first for chat history)
        messages.sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Mark unread messages logic removed as API only allows sender to update messages
        // const unreadMessages = messages.filter(msg => msg.senderId === recipientId && !msg.read);
        // if (unreadMessages.length > 0) {
        //     Promise.all(unreadMessages.map(msg => 
        //         updatePrivateMessage(msg.id, { read: true }, token).catch(e => console.error("Failed to mark read", e))
        //     ));
        // }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ recipientId: string }> }
) {
    try {
        const { recipientId } = await params;
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (!body.body) {
            return NextResponse.json({ error: "Message body is required" }, { status: 400 });
        }

        const message = await sendPrivateMessage({
            recipientId,
            body: body.body,
            title: "Chat Message", // Default title since we are simulating chat
        }, token);

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
