async function main() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "HTTP-Referer": "https://fisherdirect.vercel.app",
                "X-Title": "FisherDirect AI",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-pro-exp-02-05:free",
                messages: [{ role: "user", content: "test" }]
            })
        });
        const data = await response.json();
        console.log("OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("ERROR", e);
    }
}
main();
