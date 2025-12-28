import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/forums";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password, displayName } = body;

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email, and password are required" },
                { status: 400 }
            );
        }

        const user = await register({ username, email, password, displayName });

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
