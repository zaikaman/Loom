import { NextRequest, NextResponse } from "next/server";
import { getMe, resetPassword } from "@/lib/forums";
import { getSession } from "@/lib/session";

// POST /api/user/password - Change user password
export async function POST(request: NextRequest) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();

        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Call the Foru.ms reset-password endpoint
        const result = await resetPassword({
            email: user.email,
            oldPassword: currentPassword,
            password: newPassword,
        }, token);

        return NextResponse.json({ message: result.message || "Password changed successfully" });
    } catch (error) {
        console.error("[POST /api/user/password] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to change password";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
