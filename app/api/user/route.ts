import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsUser, getMe } from "@/lib/forums";
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

// PUT /api/user - Update current user (test endpoint for extendedData)
export async function PUT(request: NextRequest) {
    try {
        const token = await getSession();
        console.log("[PUT /api/user] Token present:", !!token);
        console.log("[PUT /api/user] Token length:", token?.length);

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();

        console.log("[PUT /api/user] Updating user:", user.id);
        console.log("[PUT /api/user] Current extendedData:", user.extendedData);
        console.log("[PUT /api/user] New data:", body);

        // Try to update extendedData
        const updatedUser = await forumsRequest<ForumsUser>({
            method: "PUT",
            path: `/api/v1/user/${user.id}`,
            body: {
                extendedData: body.extendedData,
            },
            token, // Use JWT token
        });

        console.log("[PUT /api/user] Success! Updated extendedData:", updatedUser.extendedData);

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("[PUT /api/user] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to update user";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
