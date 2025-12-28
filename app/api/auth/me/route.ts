import { NextRequest, NextResponse } from "next/server";
import { getMe } from "@/lib/forums";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const user = await getMe(token);

        return NextResponse.json({ user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get user";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
