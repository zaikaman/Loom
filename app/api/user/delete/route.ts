import { NextRequest, NextResponse } from "next/server";
import { getMe, deleteUser } from "@/lib/forums";
import { getSession, clearSession } from "@/lib/session";

// DELETE /api/user/delete - Delete user account
export async function DELETE(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();

        const { confirmUsername } = body;

        // Require username confirmation for safety
        if (confirmUsername !== user.username) {
            return NextResponse.json(
                { error: "Username confirmation does not match" },
                { status: 400 }
            );
        }

        // Delete the user via Foru.ms API (needs both API Key and Bearer token)
        await deleteUser(user.id, token);

        // Clear the session
        await clearSession();

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("[DELETE /api/user/delete] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to delete account";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

