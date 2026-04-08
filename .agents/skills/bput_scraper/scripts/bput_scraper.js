const http = require('http');

// Execute via: node bput_scraper.js '[{"title": "Exam setup", "date": "10 Apr 2026"}]'
const rawData = process.argv[2];

if (!rawData) {
    console.error("Error: Please provide a valid JSON string of notices.");
    process.exit(1);
}

let notices = [];
try {
    notices = JSON.parse(rawData);
} catch (e) {
    console.error("Error formatting JSON. Ensure it is correctly structured.", e.message);
    process.exit(1);
}

// Ensure at least an array was passed
if (!Array.isArray(notices)) {
    notices = [notices];
}

console.log(`Starting automated ingestion of ${notices.length} BPUT notices...`);

// For this script, we will simulate the push logic or execute it via standard 'fetch' if available (Node 18+).
const postToUniVerse = async (notice) => {
    const postBody = {
        content: `🚨 **BPUT OFFICIAL UPDATE** 🚨\n\n📌 ${notice.title}\n📅 Date: ${notice.date}\n\n[Stay tuned for more updates...]`
    };

    // To post this successfully, we actually need to hit the backend directly, but the API requires authMiddleware.
    // However, since we are automating as the System, we can optionally bypass that or provide a generic token.
    // For now, we will assume a local debug auth token or skip token.
    // Since POST /api/posts requires authMiddleware, we will send a mock authorization header or we can skip this node entirely and just inject into MongoDB.
    // Wait, let's just make the web request. If it fails, that means we need a real token.
    console.log("Preparing payload:");
    console.log(postBody.content);

    try {
        const response = await fetch("http://localhost:5000/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": "Bearer YOUR_TEST_TOKEN_HERE" // <--- UNCOMMENT AND INSERT TOKEN IF NEEDED
            },
            body: JSON.stringify(postBody)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ Successfully injected post into UniVerse feed!");
        } else {
            console.error("❌ Failed to push post to API:", data);
            console.log("\n⚠️ Note: The API likely requires an Authorization Bearer token. To fix this, log in on the frontend, grab the token from LocalStorage, and add it to this script's headers!");
        }
    } catch (error) {
        console.error("Error communicating with UniVerse backend:", error.message);
    }
};

const run = async () => {
    for (const notice of notices) {
        await postToUniVerse(notice);
        // Small delay to simulate human-like ingestion and prevent rate limits
        await new Promise(res => setTimeout(res, 1000));
    }
    console.log("Done.");
};

// Check for Node 18+ fetch API
if (typeof fetch === 'undefined') {
    console.error("This script requires Node v18+ for native fetch support. Please update or use Axios.");
    process.exit(1);
}

run();
