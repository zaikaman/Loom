import { NextRequest, NextResponse } from "next/server";
import { updateUser, getMe } from "@/lib/forums";
import { getSession } from "@/lib/session";

// PUT /api/user - Update current user's profile
export async function PUT(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const currentUser = await getMe(token);
        const body = await request.json();
        const { displayName, bio } = body;

        const updatedUser = await updateUser(currentUser.id, {
            displayName,
            bio,
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
