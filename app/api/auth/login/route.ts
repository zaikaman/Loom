import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/forums";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { login: loginOrEmail, password } = body;

        if (!loginOrEmail || !password) {
            return NextResponse.json(
                { error: "Login and password are required" },
                { status: 400 }
            );
        }

        const result = await login(loginOrEmail, password);

        // Store the token in an HTTP-only cookie
        await setSession(result.token);

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
