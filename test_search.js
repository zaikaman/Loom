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
            JSON.stringify(errorData)
        );
    }

    if (response.status === 204) {
        return {};
    }

    return response.json();
}

async function testVariation(name, path) {
    try {
        process.stdout.write(`Testing ${name}... `);
        const result = await forumsRequest({
            method: "GET",
            path,
        });
        console.log(`SUCCESS`);
        return true;
    } catch (e) {
        console.log(`FAILED: ${e.message}`);
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    const q = "Test";

    await testVariation("Ref", `/api/v1/search?q=${q}&type=user`); await sleep(500);

    // Common search params
    await testVariation("Limit", `/api/v1/search?q=${q}&type=user&limit=10`); await sleep(500);
    await testVariation("Page", `/api/v1/search?q=${q}&type=user&page=1`); await sleep(500);

    // Type variations
    await testVariation("Type Plural", `/api/v1/search?q=${q}&type=users`); await sleep(500);
    await testVariation("Type Capital", `/api/v1/search?q=${q}&type=User`); await sleep(500);

    // Query params
    await testVariation("Query", `/api/v1/search?query=${q}&type=user`); await sleep(500);

    // Other
    await testVariation("All", `/api/v1/search?q=${q}&type=user&limit=10&page=1`); await sleep(500);
}

runTests();
