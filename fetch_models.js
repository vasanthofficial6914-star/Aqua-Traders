async function getModels() {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/models");
        const data = await res.json();
        const freeModels = data.data.filter(m => m.id.includes("free"));
        console.log("FREE MODELS AVAILABLE:");
        freeModels.forEach(m => console.log(m.id));
    } catch(e) { console.error(e); }
}
getModels();
