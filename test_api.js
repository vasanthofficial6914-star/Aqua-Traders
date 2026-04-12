const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    try {
        const res = await fetch('http://localhost:5000/api/services/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'fisherman', messages: [{ sender: 'user', text: 'hi' }] })
        });
        const data = await res.json();
        console.log("SERVER RESPONSE:", data);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
