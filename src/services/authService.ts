import API_BASE_URL from "../config/api";

export async function signupUser(data: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Signup failed");
        }

        return result;
    } catch (error) {
        console.error("Signup API error:", error);
        throw error;
    }
}

export async function loginUser(data: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        return result;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
}
