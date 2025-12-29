const FORUMS_BASE_URL = "https://foru.ms";

async function forumsRequest({
    method,
    path,
    body,
    token,
}) {
    const headers = {
        "Content-Type": "application/json",
    };

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
        throw new Error(
            errorData.message || errorData.error || `Foru.ms API error: ${response.status}`
        );
    }

    return response.json();
}

async function runTests() {
    const q = "Test";
    try {
        process.stdout.write(`Testing search with 'query' and 'type=users'... `);
        const result = await forumsRequest({
            method: "GET",
            // Corrected params based on user's manual docs
            path: `/api/v1/search?query=${encodeURIComponent(q)}&type=users`,
        });
        console.log("SUCCESS");
        console.log("Result preview:", JSON.stringify(result).substring(0, 100));
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
    }
}

runTests();
