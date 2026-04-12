const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gemboyvasa196@gmail.com",   
        pass: "texs zvn uqer selx"             
    }
});

async function sendMail(to, subject, message) {
    try {
        await transporter.sendMail({
            from: '"மீனவன் System" <gemboyvasa1496@gmail.com>',
            to: to,
            subject: subject,
            html: message
        });

        console.log("✅ Email sent successfully");
    } catch (error) {
        console.log("❌ Email error:", error);
    }
}

module.exports = sendMail;
