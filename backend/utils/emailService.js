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
    }
};

// Shared layout wrapper for all emails
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:12px 16px;">
                    <span style="font-size:24px;">🛡️</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Lost Guard</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color:#1e293b;border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${content}
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="color:#64748b;font-size:12px;margin:0;">© ${new Date().getFullYear()} Lost Guard Platform</p>
              <p style="color:#475569;font-size:11px;margin:8px 0 0;">This is an automated notification. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const templates = {
    // 1. Welcome Email — sent on registration
    welcome: (name) => emailWrapper(`<td style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:48px;">🎉</span>
        </div>
        <h1 style="color:#ffffff;font-size:24px;font-weight:700;text-align:center;margin:0 0 8px;">Welcome to Lost Guard!</h1>
        <p style="color:#94a3b8;font-size:14px;text-align:center;margin:0 0 32px;">Your account has been created successfully</p>
        
        <div style="background-color:#0f172a;border-radius:12px;padding:20px;border:1px solid rgba(99,102,241,0.15);margin-bottom:24px;">
          <p style="color:#e2e8f0;font-size:16px;margin:0;">Hello <strong style="color:#a78bfa;">${name}</strong>,</p>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:12px 0 0;">
            Thank you for joining our community. We're dedicated to helping you recover your lost belongings and connect with honest finders.
          </p>
        </div>
        
        <h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 12px;">🚀 Get Started</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:8px 0;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="background-color:rgba(99,102,241,0.1);border-radius:8px;padding:8px 12px;width:36px;text-align:center;">
                  <span style="font-size:16px;">📦</span>
                </td>
                <td style="padding-left:12px;color:#cbd5e1;font-size:13px;">Report a lost or found item</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="background-color:rgba(99,102,241,0.1);border-radius:8px;padding:8px 12px;width:36px;text-align:center;">
                  <span style="font-size:16px;">🔍</span>
                </td>
                <td style="padding-left:12px;color:#cbd5e1;font-size:13px;">Browse and search discovered items</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="background-color:rgba(99,102,241,0.1);border-radius:8px;padding:8px 12px;width:36px;text-align:center;">
                  <span style="font-size:16px;">✅</span>
                </td>
                <td style="padding-left:12px;color:#cbd5e1;font-size:13px;">Submit ownership claims with proof</td>
              </tr></table>
            </td>
          </tr>
        </table>
        
        <div style="text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:14px 32px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Open Lost Guard App</span>
          </div>
        </div>
      </td>`),

    // 2. New Claim — sent to item reporter when someone claims their item
    newClaim: (itemName, claimantName) => emailWrapper(`<td style="padding:0;">
        <div style="background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.15));padding:32px;text-align:center;">
          <span style="font-size:40px;">🔍</span>
          <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:12px 0 4px;">New Ownership Claim</h2>
          <p style="color:#a5b4fc;font-size:13px;margin:0;">Someone believes this item belongs to them</p>
        </div>
        
        <div style="padding:32px;">
          <div style="background-color:#0f172a;border-radius:12px;padding:20px;border:1px solid rgba(99,102,241,0.15);margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Item</span>
                  <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:4px 0 0;">${itemName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Claimant</span>
                  <p style="color:#a78bfa;font-size:16px;font-weight:600;margin:4px 0 0;">${claimantName}</p>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Please open the app to review the proof provided and communicate with the claimant via chat.
          </p>
          
          <div style="text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:14px 32px;">
              <span style="color:#ffffff;font-size:14px;font-weight:600;">Review Claim</span>
            </div>
          </div>
        </div>
      </td>`),

    // 3. Claim Decision — sent to claimant when admin approves/rejects
    claimUpdate: (itemName, status, remarks) => emailWrapper(`<td style="padding:0;">
        <div style="background:linear-gradient(135deg,${status === 'Approved' ? 'rgba(16,185,129,0.3),rgba(6,95,70,0.15)' : 'rgba(239,68,68,0.3),rgba(127,29,29,0.15)'});padding:32px;text-align:center;">
          <span style="font-size:40px;">${status === 'Approved' ? '✅' : '❌'}</span>
          <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:12px 0 4px;">Claim ${status}</h2>
          <p style="color:${status === 'Approved' ? '#6ee7b7' : '#fca5a5'};font-size:13px;margin:0;">Your ownership claim has been reviewed</p>
        </div>
        
        <div style="padding:32px;">
          <div style="background-color:#0f172a;border-radius:12px;padding:20px;border:1px solid ${status === 'Approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Item</span>
                  <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:4px 0 0;">${itemName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Decision</span>
                  <p style="color:${status === 'Approved' ? '#10b981' : '#ef4444'};font-size:16px;font-weight:700;margin:4px 0 0;">${status.toUpperCase()}</p>
                </td>
              </tr>
              ${remarks ? `
              <tr>
                <td style="padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Admin Remarks</span>
                  <p style="color:#cbd5e1;font-size:14px;font-style:italic;margin:4px 0 0;">"${remarks}"</p>
                </td>
              </tr>` : ''}
            </table>
          </div>
          
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            ${status === 'Approved'
              ? 'Congratulations! You can now coordinate the recovery with the finder through the in-app chat.'
              : 'If you believe this decision is incorrect, you may submit additional proof or contact support through the app.'}
          </p>
          
          <div style="text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,${status === 'Approved' ? '#10b981,#059669' : '#6366f1,#8b5cf6'});border-radius:12px;padding:14px 32px;">
              <span style="color:#ffffff;font-size:14px;font-weight:600;">${status === 'Approved' ? 'Start Chat' : 'Open App'}</span>
            </div>
          </div>
        </div>
      </td>`),

    // 4. New Message — sent when user receives a chat message
    newMessage: (senderName, itemName) => emailWrapper(`<td style="padding:0;">
        <div style="background:linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.1));padding:32px;text-align:center;">
          <span style="font-size:40px;">💬</span>
          <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:12px 0 4px;">New Message</h2>
          <p style="color:#a5b4fc;font-size:13px;margin:0;">You have an unread message</p>
        </div>
        
        <div style="padding:32px;">
          <div style="background-color:#0f172a;border-radius:12px;padding:20px;border:1px solid rgba(99,102,241,0.15);margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">From</span>
                  <p style="color:#a78bfa;font-size:16px;font-weight:600;margin:4px 0 0;">${senderName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Regarding</span>
                  <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:4px 0 0;">${itemName}</p>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Open the app to read the full message and reply.
          </p>
          
          <div style="text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:14px 32px;">
              <span style="color:#ffffff;font-size:14px;font-weight:600;">Reply Now</span>
            </div>
          </div>
        </div>
      </td>`),

    // 5. Item Match — sent when AI matching finds a potential match
    itemMatch: (itemName, matchType) => emailWrapper(`<td style="padding:0;">
        <div style="background:linear-gradient(135deg,rgba(245,158,11,0.3),rgba(180,83,9,0.15));padding:32px;text-align:center;">
          <span style="font-size:40px;">✨</span>
          <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:12px 0 4px;">Potential Match Found!</h2>
          <p style="color:#fcd34d;font-size:13px;margin:0;">Our system detected a possible match</p>
        </div>
        
        <div style="padding:32px;">
          <div style="background-color:#0f172a;border-radius:12px;padding:20px;border:1px solid rgba(245,158,11,0.2);margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Item</span>
                  <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:4px 0 0;">${itemName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Type</span>
                  <p style="color:#fbbf24;font-size:16px;font-weight:600;margin:4px 0 0;">${matchType}</p>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Someone just posted a report that closely matches your item. Check the <strong style="color:#e2e8f0;">"Suggested Matches"</strong> tab in your item details to review.
          </p>
          
          <div style="text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:14px 32px;">
              <span style="color:#ffffff;font-size:14px;font-weight:600;">View Matches</span>
            </div>
          </div>
        </div>
      </td>`)
};

module.exports = { sendEmail, templates };
