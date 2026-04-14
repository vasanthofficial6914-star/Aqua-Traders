import API_BASE_URL from "../config/api";

export async function signupUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error("Signup failed");
    }

    return response.json();
}

export async function loginUser(credentials: any) {
    const loginUrl = `${API_BASE_URL}/login`;
    console.log("🚀 Attempting login to:", loginUrl);
    
    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });

        // Step 4: Debugging Improvement - Log raw response
        const text = await response.text();
        console.log("Raw Response:", text);

        // Check if response is HTML
        if (text.startsWith("<!DOCTYPE") || response.headers.get("Content-Type")?.includes("text/html")) {
            throw new Error("Server error: Received HTML instead of JSON. Check backend connection.");
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        return data;
    } catch (error: any) {
        console.error("❌ Login error:", error);
        throw error;
    }
}
