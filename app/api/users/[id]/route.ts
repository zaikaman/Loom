import { NextRequest, NextResponse } from "next/server";
import { getUser, ForumsUser } from "@/lib/forums";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        try {
            const user = await getUser(id);
            return NextResponse.json({ user });
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error in user API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
