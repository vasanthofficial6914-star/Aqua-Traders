import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'gemboyvasa1496@gmail.com', // Using the previous user's credentials or mock
        pass: 'shyfanszyxsrlfnb', // The app password provided earlier
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.post('/api/alert', async (req, res) => {
    const { load, status, fisherman, issueType } = req.body;

    let subject = `⚠️ URGENT: Net Alert - ${fisherman}`;
    let issueDescription = "Unsafe condition detected.";
    let actionRequired = "Please check the net immediately.";
    let icon = "🚨";

    switch (issueType) {
        case 'OVERLOAD':
            subject = `🚨 URGENT: Net Overload Alert - ${fisherman}`;
            issueDescription = "The net load has exceeded the safe threshold of 50kg.";
            actionRequired = "Stop the motor and pull the net manually or reduce the load immediately.";
            icon = "⚖️";
            break;
        case 'TANGLE':
            subject = `🌀 WARNING: Net Tangle Detected - ${fisherman}`;
            issueDescription = "The system has detected an unusual resistance pattern consistent with a net tangle.";
            actionRequired = "Back down the vessel and inspect the lines for entanglement.";
            icon = "🌀";
            break;
        case 'TEAR':
            subject = `❌ CRITICAL: Net Tearing Detected - ${fisherman}`;
            issueDescription = "Sensors indicate a sudden loss of tension consistent with net tearing or a large hole.";
            actionRequired = "Haul in the net immediately to prevent catch loss and further damage.";
            icon = "✂️";
            break;
    }

    const mailOptions = {
        from: '"FisherDirect Alert System" <gemboyvasa1496@gmail.com>',
        to: 'gemboyvasa1496@gmail.com',
        subject: subject,
        text: `Urgent alert for Captain ${fisherman}.\n\nIssue: ${issueType}\nDescription: ${issueDescription}\nStatus: ${status}\nLoad: ${load}kg\n\n${actionRequired}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px;">
                <h2 style="color: #ef4444;">${icon} ${issueType} Alert</h2>
                <p>Hello Captain <strong>${fisherman}</strong>,</p>
                <p style="font-size: 1.1rem; color: #1e293b;">${issueDescription}</p>
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ef4444;">${status}</span></p>
                    <p style="margin: 5px 0;"><strong>Current Load:</strong> ${load}kg</p>
                </div>
                <p><strong>ACTION REQUIRED:</strong> ${actionRequired}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 0.8rem; color: #64748b;">This is an automated safety alert from FisherDirect Smart Systems.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully to gemboyvasa1496@gmail.com');
        res.status(200).json({ success: true, message: 'Alert sent' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const { messages, role } = req.body;

    const systemPrompt = role === 'fisherman'
        ? "You are the FisherDirect AI Captain. Provide expert advice on sea conditions, fish pricing, sustainable fishing, and net maintenance. Be encouraging and practical. Use ocean-themed metaphors occasionally."
        : "You are the FisherDirect Fresh Guide. Help customers find the freshest seafood, suggest local varieties, provide simple and delicious recipes, and explain how to support local fishermen. Be helpful and enthusiastic.";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer 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`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "FisherDirect AI",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    ...messages.map(m => ({
                        "role": m.sender === 'ai' ? 'assistant' : 'user',
                        "content": m.text
                    }))
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            const aiMessage = data.choices[0].message.content;
            return res.json({ text: aiMessage });
        } else {
            throw new Error("Invalid API response format");
        }
    } catch (error) {
        console.error('OpenRouter API Error - Falling back to local dataset:', error.message);
        
        const localDataset = {
            fisherman: [
                { keywords: ['weather', 'sea', 'condition', 'storm', 'wind', 'rain', 'wave'], response: "Captain, always check the local meteorological reports. If the swelling is high or winds are picking up, it's safer to stay docked. Safety first!" },
                { keywords: ['price', 'pricing', 'sell', 'market', 'money', 'cost', 'rate'], response: "Market prices fluctuate, but fresh catches like Tuna and Mackerel usually fetch a premium at the local harbor if you sell straight to the consumer." },
                { keywords: ['net', 'maintenance', 'tear', 'tangle', 'repair', 'gear'], response: "Inspect your nets before dropping them. A small tear now can mean a lost catch later. Wash them with fresh water after every trip to prevent salt damage." },
                { keywords: ['sustainable', 'overfishing', 'rules', 'quota', 'limit'], response: "Remember, ethical fishing ensures our oceans thrive. Avoid overfished areas, let the juveniles go, and respect the local catch quotas." },
                { keywords: ['hello', 'hi', 'hey', 'greetings', 'ahoy'], response: "Ahoy Captain! How can I assist you with your voyage or gear today?" },
                { keywords: [], response: "Ahoy! The network is a bit stormy right now (using local backup). Make sure your gear is tight and stay safe out there. Do you need advice on nets, weather, or pricing?" }
            ],
            customer: [
                { keywords: ['fresh', 'buy', 'seafood', 'fish', 'where', 'find'], response: "Welcome! To find the freshest catch, look for clear eyes, bright red gills, and a smell of the ocean (not fishiness). Buying direct from FisherDirect guarantees quality!" },
                { keywords: ['recipe', 'cook', 'prepare', 'dish', 'fry', 'bake', 'grill'], response: "A quick pan-sear with garlic, butter, and a squeeze of lemon is perfect for fresh white fish. Don't overcook it—it should just be opaque and flaky." },
                { keywords: ['local', 'support', 'fisherman', 'community', 'help'], response: "Buying direct from FisherDirect means better prices for the captains and much fresher food for your table. You're supporting independent fleets directly!" },
                { keywords: ['hello', 'hi', 'hey', 'greetings'], response: "Hello there! Looking for some fresh seafood recommendations or recipes today?" },
                { keywords: [], response: "Hello! Our connection is a bit like a tangled net right now (local backup). But remember: always buy local and fresh! Are you looking for recipes or buying advice?" }
            ]
        };

        const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user')?.text?.toLowerCase() || '';
        const dataset = role === 'fisherman' ? localDataset.fisherman : localDataset.customer;
        
        let fallbackResponse = "";
        for (const item of dataset) {
            if (item.keywords.length > 0 && item.keywords.some(kw => lastUserMessage.includes(kw))) {
                fallbackResponse = item.response;
                break;
            }
        }
        
        if (!fallbackResponse) {
            fallbackResponse = dataset.find(item => item.keywords.length === 0).response;
        }

        // Return a successful 200 response with the fallback text
        res.json({ text: fallbackResponse });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `API Route Not Found on this server: ${req.originalUrl}` });
});

const PORT = 3002;
const server = app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`🚀 ALERT SERVER ACTIVE`);
    console.log(`🔗 Endpoint: http://localhost:${PORT}/api/alert`);
    console.log(`📧 Sending from: gemboyvasa1496@gmail.com`);
    console.log('---------------------------------------------');
    console.log('KEEP THIS TERMINAL OPEN TO SEND EMAILS!');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ ERROR: Port ${PORT} is already in use. Please close existing servers.`);
    } else {
        console.error('❌ SERVER ERROR:', err);
    }
});

process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
});
