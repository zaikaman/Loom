import { NextRequest, NextResponse } from "next/server";
import { getMe, updateUser } from "@/lib/forums";
import { getSession } from "@/lib/session";

// GET /api/user - Get current user
export async function GET(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        return NextResponse.json({ user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch user";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PUT /api/user - Update current user
export async function PUT(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();

        // Update user profile - API needs both API Key and Bearer token
        const updatedUser = await updateUser(user.id, {
            displayName: body.displayName,
            bio: body.bio,
            extendedData: body.extendedData,
        }, token);

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("[PUT /api/user] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to update user";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

