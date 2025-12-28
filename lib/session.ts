import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "loom_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSession(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    return sessionCookie?.value || null;
}

export async function setSession(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
    });
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
