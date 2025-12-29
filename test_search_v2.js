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

    // console.log(`REQ: ${method} ${url}`);

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData));
    }

    return response.json();
}

async function runTests() {
    console.log("Starting tests...");

    // 1. Validate type=threads (from user hint)
    try {
        process.stdout.write("Test 1: GET type=threads (q=Test)... ");
        const res = await forumsRequest({
            method: "GET",
            path: `/api/v1/search?q=Test&type=threads`
        });
        console.log("SUCCESS");
        // console.log(JSON.stringify(res).substring(0, 100));
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
    }

    // 2. Try POST for user search
    try {
        process.stdout.write("Test 2: POST type=user (body={q:'Test'})... ");
        const res = await forumsRequest({
            method: "POST",
            path: `/api/v1/search?type=user`,
            body: { q: "Test" }
        });
        console.log("SUCCESS");
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
    }

    // 3. Try POST for user search body={query:'Test'}
    try {
        process.stdout.write("Test 3: POST type=user (body={query:'Test'})... ");
        const res = await forumsRequest({
            method: "POST",
            path: `/api/v1/search?type=user`,
            body: { query: "Test" }
        });
        console.log("SUCCESS");
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
    }

    // 4. Try GET type=user q=Test AGAIN
    try {
        process.stdout.write("Test 4: GET type=user (q=Test)... ");
        const res = await forumsRequest({
            method: "GET",
            path: `/api/v1/search?q=Test&type=user`
        });
        console.log("SUCCESS");
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
    }
}

runTests();
