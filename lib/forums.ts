const FORUMS_BASE_URL = "https://foru.ms";

interface ForumsRequestOptions {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    body?: Record<string, unknown>;
    token?: string; // JWT token for user-authenticated requests
}

/**
 * Makes a request to the Foru.ms API.
 * Uses API Key auth by default, or Bearer token if provided.
 */
export async function forumsRequest<T = unknown>({
    method,
    path,
    body,
    token,
}: ForumsRequestOptions): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Use Bearer token if provided (user session), otherwise API Key
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else {
        const apiKey = process.env.FORUMS_API_KEY;
        if (!apiKey) {
            throw new Error("FORUMS_API_KEY is not set in environment variables");
        }
        headers["x-api-key"] = apiKey;
    }

    const url = `${FORUMS_BASE_URL}${path}`;

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[forumsRequest] Error response:", JSON.stringify(errorData, null, 2));
        throw new Error(
            errorData.message || errorData.error || `Foru.ms API error: ${response.status}`
        );
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json() as Promise<T>;
}

// --- Typed API Helpers ---

export interface ForumsUser {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    bio?: string;
    roles?: string[];
    extendedData?: Record<string, unknown>;
}

export interface ForumsThread {
    id: string;
    title: string;
    slug: string;
    body?: string;
    locked?: boolean;
    pinned?: boolean;
    user?: { id: string; username: string };
    tags?: { id: string; name: string; color?: string }[];
    extendedData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface ForumsPost {
    id: string;
    body: string;
    userId: string;
    threadId: string;
    parentId?: string;
    bestAnswer?: boolean;
    likes?: { id: string; userId: string }[];
    upvotes?: { id: string; userId: string }[];
    extendedData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// --- Auth ---

export async function login(loginOrEmail: string, password: string) {
    return forumsRequest<{ token: string }>({
        method: "POST",
        path: "/api/v1/auth/login",
        body: { login: loginOrEmail, password },
    });
}

export async function register(data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
}) {
    return forumsRequest<ForumsUser>({
        method: "POST",
        path: "/api/v1/auth/register",
        body: data,
    });
}

export async function getMe(token: string) {
    return forumsRequest<ForumsUser>({
        method: "GET",
        path: "/api/v1/auth/me",
        token,
    });
}

// --- Threads (Roadmaps) ---

export async function createThread(data: {
    title: string;
    body?: string;
    slug?: string;
    userId: string;
    tags?: string[];
    extendedData?: Record<string, unknown>;
}) {
    return forumsRequest<ForumsThread>({
        method: "POST",
        path: "/api/v1/thread",
        body: data,
    });
}

export async function getThread(id: string) {
    return forumsRequest<ForumsThread>({
        method: "GET",
        path: `/api/v1/thread/${id}`,
    });
}

export async function updateThread(
    id: string,
    data: Partial<{
        title: string;
        body: string;
        slug: string;
        locked: boolean;
        pinned: boolean;
        extendedData: Record<string, unknown>;
    }>,
    userId?: string
) {
    return forumsRequest<ForumsThread>({
        method: "PUT",
        path: `/api/v1/thread/${id}`,
        body: { ...data, userId },
    });
}

export async function deleteThread(id: string) {
    return forumsRequest<ForumsThread>({
        method: "DELETE",
        path: `/api/v1/thread/${id}`,
    });
}

// --- Posts (Features) ---

export async function createPost(data: {
    body: string;
    threadId: string;
    userId: string;
    parentId?: string;
    extendedData?: Record<string, unknown>;
}) {
    return forumsRequest<ForumsPost>({
        method: "POST",
        path: "/api/v1/post",
        body: data,
    });
}

// Note: Getting posts requires using the search endpoints or fetching via thread
// The Foru.ms API doesn't have a direct GET /api/v1/post/:id in the docs I read,
// but we can work around this by storing post IDs and using thread-based queries.

// Get all posts for a thread
export async function getPosts(threadId: string): Promise<ForumsPost[]> {
    return forumsRequest<ForumsPost[]>({
        method: "GET",
        path: `/api/v1/thread/${threadId}/posts`,
    });
}

// Get a single post by ID
export async function getPost(postId: string): Promise<ForumsPost> {
    return forumsRequest<ForumsPost>({
        method: "GET",
        path: `/api/v1/post/${postId}`,
    });
}

// --- User ---

export async function updateUser(
    id: string,
    data: Partial<{
        displayName: string;
        bio: string;
        extendedData: Record<string, unknown>;
    }>,
    token?: string
) {
    return forumsRequest<ForumsUser>({
        method: "PUT",
        path: `/api/v1/user/${id}`,
        body: data,
        token,
    });
}

// Get a user by ID
export async function getUser(id: string): Promise<ForumsUser> {
    return forumsRequest<ForumsUser>({
        method: "GET",
        path: `/api/v1/user/${id}`,
    });
}

// Search users by username (using the search endpoint)
export async function searchUsers(query: string): Promise<ForumsUser[]> {
    // The Foru.ms API has a search endpoint that can search users
    const result = await forumsRequest<{ users?: ForumsUser[] }>({
        method: "GET",
        path: `/api/v1/search?query=${encodeURIComponent(query)}&type=users`,
    });
    return result.users || [];
}
