import { NextRequest, NextResponse } from "next/server";
import { searchUsers, getMe } from "@/lib/forums";
import { getSession } from "@/lib/session";

// GET /api/user/search?q=username - Search for users by username
export async function GET(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Verify the user is logged in
        await getMe(token);

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        console.log("[GET /user/search] Searching for users:", query);

        const users = await searchUsers(query);

        // Return only essential user info for privacy
        const sanitizedUsers = users.map((user) => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
        }));

        return NextResponse.json({ users: sanitizedUsers });
    } catch (error) {
        console.error("[GET /user/search] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to search users";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
