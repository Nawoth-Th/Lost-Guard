const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Lost Guard" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error('Email send error:', error.message);
        // We don't throw error here to prevent blocking the main process
    }
};

const templates = {
    welcome: (name) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #6366f1;">Welcome to Lost Guard, ${name}! 🛡️</h1>
            <p>Thank you for joining our community. We're here to help you recover your lost items and connect with honest finders.</p>
            <p>Start by reporting an item or browsing the latest findings.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">This is an automated message from the Lost Guard Platform.</p>
        </div>
    `,
    newClaim: (itemName, claimantName) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">New Claim for Your Item! 🔍</h2>
            <p>Great news! <strong>${claimantName}</strong> has submitted an ownership claim for your item: <strong>${itemName}</strong>.</p>
            <p>Please log in to the app to review the proof provided and communicate with the claimant via chat.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Lost Guard - Helping you find what matters.</p>
        </div>
    `,
    claimUpdate: (itemName, status, remarks) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: ${status === 'Approved' ? '#10b981' : '#ef4444'};">Claim Update: ${status}</h2>
            <p>Your claim for the item <strong>${itemName}</strong> has been <strong>${status.toLowerCase()}</strong> by the admin.</p>
            ${remarks ? `<p><strong>Admin Remarks:</strong> ${remarks}</p>` : ''}
            <p>${status === 'Approved' ? 'You can now coordinate the recovery with the finder through the app chat.' : 'If you believe this is an error, please contact support.'}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Lost Guard Security Notification</p>
        </div>
    `,
    newMessage: (senderName, itemName) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">New Message Received! 💬</h2>
            <p><strong>${senderName}</strong> has sent you a message regarding the item: <strong>${itemName}</strong>.</p>
            <p>Please log in to the Lost Guard app to reply.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Lost Guard Notifications</p>
        </div>
    `,
    itemMatch: (itemName, matchType) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #f59e0b;">Potential Match Found! ✨</h2>
            <p>We found a potential match for your <strong>${matchType}</strong> item: <strong>${itemName}</strong>!</p>
            <p>Someone just posted a report that matches your criteria. Check the "Suggested Matches" section in your item details.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Lost Guard Automated Matching System</p>
        </div>
    `
};

module.exports = { sendEmail, templates };
