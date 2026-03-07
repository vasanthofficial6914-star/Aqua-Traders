import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'gemboyvasa1496@gmail.com',
        pass: process.env.EMAIL_PASS || 'shyfanszyxsrlfnb',
    },
    tls: {
        rejectUnauthorized: false
    }
});

// @desc    Send net alert email
// @route   POST /api/services/alert
router.post('/alert', async (req, res) => {
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
        from: `"FisherDirect Alert System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
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
        console.log(`Alert email sent successfully to ${process.env.EMAIL_USER}`);
        res.status(200).json({ success: true, message: 'Alert sent' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    AI Chat with OpenRouter
// @route   POST /api/services/chat
router.post('/chat', async (req, res) => {
    const { messages, role } = req.body;

    const systemPrompt = role === 'fisherman'
        ? "You are the FisherDirect AI Captain. Provide expert advice on sea conditions, fish pricing, sustainable fishing, and net maintenance. Be encouraging and practical. Use ocean-themed metaphors occasionally."
        : "You are the FisherDirect Fresh Guide. Help customers find the freshest seafood, suggest local varieties, provide simple and delicious recipes, and explain how to support local fishermen. Be helpful and enthusiastic.";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer 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`,
                "HTTP-Referer": "https://fisher-man-deployed.vercel.app", // Placeholder
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

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        res.json({ text: aiMessage });
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        res.status(500).json({ text: "I'm having a bit of trouble connecting to the ocean depths (API Error). Try again in a moment!" });
    }
});

export default router;
