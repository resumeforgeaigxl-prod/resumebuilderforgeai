/**
 * lib/brevo.ts
 * Central Brevo email sender for ResumeForgeAI.
 * Uses Brevo Transactional Email API (v3).
 *
 * All emails share a common branded HTML wrapper.
 * Individual send functions are exported for each event.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const FROM = {
    name: process.env.BREVO_FROM_NAME ?? 'ResumeForgeAI',
    email: process.env.BREVO_FROM_EMAIL ?? 'support@resumeforgeai.in',
};

// ── Low-level sender ─────────────────────────────────────────────────────────

interface BrevoRecipient { email: string; name?: string }
interface BrevoAttachment { name: string; content: string } // base64

interface SendEmailOptions {
    to: BrevoRecipient[];
    subject: string;
    html: string;
    attachments?: BrevoAttachment[];
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('[Brevo] BREVO_API_KEY not set — email skipped');
        return false;
    }

    try {
        const res = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                sender: FROM,
                to: opts.to,
                subject: opts.subject,
                htmlContent: opts.html,
                ...(opts.attachments?.length ? { attachment: opts.attachments } : {}),
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Brevo] Send failed:', res.status, err);
            return false;
        }
        return true;
    } catch (err) {
        console.error('[Brevo] Network error:', err);
        return false;
    }
}

// ── Shared HTML wrapper ──────────────────────────────────────────────────────

function emailWrapper(bodyHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ResumeForgeAI</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header / Logo -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">✦</div>
              <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">ResumeForge<span style="color:#a78bfa;">AI</span></span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#13131f;padding:40px;border-left:1px solid #1e1b4b;border-right:1px solid #1e1b4b;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a14;border-radius:0 0 16px 16px;border:1px solid #1e1b4b;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">
              Need help? <a href="mailto:support@resumeforgeai.in" style="color:#818cf8;text-decoration:none;">support@resumeforgeai.in</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#374151;">
              <a href="https://resumeforgeai.in" style="color:#6b7280;text-decoration:none;">resumeforgeai.in</a>
              &nbsp;·&nbsp; You're receiving this because you have an account with ResumeForgeAI.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string, color = '#6366f1'): string {
    return `<div style="text-align:center;margin:28px 0;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${color},#a855f7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
        ${text} →
      </a>
    </div>`;
}

function headingAndSub(heading: string, sub: string): string {
    return `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f5f9;">${heading}</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#94a3b8;">${sub}</p>
    `;
}

function infoRow(label: string, value: string): string {
    return `<tr>
      <td style="padding:10px 14px;font-size:13px;color:#94a3b8;width:40%;border-bottom:1px solid #1e1b4b;">${label}</td>
      <td style="padding:10px 14px;font-size:13px;color:#e2e8f0;font-weight:600;border-bottom:1px solid #1e1b4b;">${value}</td>
    </tr>`;
}

// ── 1. Welcome Email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
    const displayName = name || to.split('@')[0];
    const html = emailWrapper(`
      ${headingAndSub(`Welcome, ${displayName}! 🎉`, 'Your AI-powered career journey starts now.')}
      <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 20px;">
        You've joined <strong style="color:#a78bfa;">ResumeForgeAI</strong> — the smartest way to build ATS-optimized resumes, 
        ace mock interviews, and land your dream job.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1c;border-radius:10px;border:1px solid #1e1b4b;margin-bottom:24px;">
        <tbody>
          ${infoRow('✦ AI Resume Builder', 'Create professional resumes in minutes')}
          ${infoRow('✦ ATS Score Checker', 'Ensure your resume passes screening')}
          ${infoRow('✦ Mock Interviews', 'Practice with AI-powered questions')}
          ${infoRow('✦ Job Board', 'Discover matched job opportunities')}
        </tbody>
      </table>
      ${ctaButton('Open Dashboard', 'https://resumeforgeai.in/dashboard')}
      <p style="text-align:center;color:#64748b;font-size:12px;margin:0;">Your free account includes 1 resume download without watermark.</p>
    `);

    await sendEmail({
        to: [{ email: to, name: displayName }],
        subject: `Welcome to ResumeForgeAI, ${displayName}! 🚀`,
        html,
    });
}

// ── 2. Payment Success + Invoice Email ───────────────────────────────────────

interface InvoiceEmailData {
    userEmail: string;
    userName?: string;
    plan: string;
    amountINR: string;
    paymentMethod: string;
    invoiceNumber: string;
    invoiceId: string;
    couponCode?: string | null;
    date: string;
}

export async function sendPaymentSuccessEmail(data: InvoiceEmailData): Promise<void> {
    const planLabel = data.plan.charAt(0) + data.plan.slice(1).toLowerCase();
    const isFree = data.amountINR === '₹0' || data.amountINR === 'Free';
    const methodLabel = data.paymentMethod === 'coupon'
        ? `Coupon${data.couponCode ? ` (${data.couponCode})` : ''}`
        : 'Razorpay';

    const html = emailWrapper(`
      ${headingAndSub(
        isFree ? '🎟 Plan Activated!' : '🎉 Payment Successful!',
        isFree
            ? `Your coupon was applied and ${planLabel} plan is now active.`
            : `Your ${planLabel} plan is now active. Thank you for your purchase!`
    )}

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1c;border-radius:10px;border:1px solid #1e1b4b;margin-bottom:24px;">
        <tbody>
          ${infoRow('Invoice Number', `<span style="font-family:monospace;color:#818cf8;">${data.invoiceNumber}</span>`)}
          ${infoRow('Plan', `<span style="color:#a78bfa;">${planLabel} Plan</span>`)}
          ${infoRow('Amount Paid', `<strong style="color:${isFree ? '#34d399' : '#f1f5f9'};">${isFree ? 'Free' : data.amountINR}</strong>`)}
          ${infoRow('Payment Method', methodLabel)}
          ${data.couponCode ? infoRow('Coupon Code', `<span style="font-family:monospace;color:#818cf8;">${data.couponCode}</span>`) : ''}
          ${infoRow('Date', data.date)}
        </tbody>
      </table>

      ${ctaButton('Go to Dashboard', 'https://resumeforgeai.in/dashboard', '#059669')}
      <p style="text-align:center;color:#64748b;font-size:12px;margin:0;">
        <a href="https://resumeforgeai.in/dashboard/invoices" style="color:#818cf8;text-decoration:none;">View all invoices →</a>
      </p>
    `);

    await sendEmail({
        to: [{ email: data.userEmail, name: data.userName }],
        subject: `${isFree ? '🎟 Plan Activated' : '✅ Payment Confirmed'} — ${planLabel} Plan | ResumeForgeAI`,
        html,
    });
}

// ── 3. Support Ticket Created (User confirmation) ────────────────────────────

export async function sendTicketConfirmationEmail(
    to: string,
    ticketId: string,
    category: string,
    message: string,
): Promise<void> {
    const html = emailWrapper(`
      ${headingAndSub('Support Ticket Received 🎫', `We've received your request and will respond shortly.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1c;border-radius:10px;border:1px solid #1e1b4b;margin-bottom:24px;">
        <tbody>
          ${infoRow('Ticket ID', `<span style="font-family:monospace;color:#818cf8;">${ticketId}</span>`)}
          ${infoRow('Category', category)}
          ${infoRow('Status', '<span style="color:#fbbf24;">Open</span>')}
        </tbody>
      </table>
      <div style="background:#0d0d1c;border-left:3px solid #6366f1;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">${message}</p>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center;">
        Our team typically responds within <strong style="color:#a78bfa;">24–48 hours</strong>. 
        You'll get an email notification when we reply.
      </p>
    `);

    await sendEmail({
        to: [{ email: to }],
        subject: `🎫 Ticket ${ticketId} — We received your request | ResumeForgeAI`,
        html,
    });
}

// ── 4. Admin reply notification ──────────────────────────────────────────────

export async function sendAdminReplyEmail(
    to: string,
    ticketId: string,
    adminReply: string,
    status: string,
): Promise<void> {
    const html = emailWrapper(`
      ${headingAndSub('Support Update 💬', `Your ticket ${ticketId} has received a reply.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1c;border-radius:10px;border:1px solid #1e1b4b;margin-bottom:20px;">
        <tbody>
          ${infoRow('Ticket ID', `<span style="font-family:monospace;color:#818cf8;">${ticketId}</span>`)}
          ${infoRow('Status', `<span style="color:${status === 'resolved' ? '#34d399' : '#fbbf24'};">${status === 'resolved' ? '✓ Resolved' : 'In Progress'}</span>`)}
        </tbody>
      </table>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Admin reply:</p>
      <div style="background:#0d0d1c;border-left:3px solid #a855f7;padding:16px 20px;border-radius:6px;margin-bottom:28px;">
        <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.7;">${adminReply}</p>
      </div>
      ${ctaButton('Open Dashboard', 'https://resumeforgeai.in/dashboard')}
    `);

    await sendEmail({
        to: [{ email: to }],
        subject: `💬 Reply on Ticket ${ticketId} | ResumeForgeAI Support`,
        html,
    });
}

// ── 5. Admin notification (new ticket alert) ─────────────────────────────────

export async function notifyAdminNewTicket(
    ticketId: string,
    userEmail: string,
    category: string,
    message: string,
): Promise<void> {
    const adminEmail = process.env.BREVO_ADMIN_EMAIL;
    if (!adminEmail) return;

    const html = emailWrapper(`
      ${headingAndSub('New Support Ticket 🚨', `A user has submitted a support request.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1c;border-radius:10px;border:1px solid #1e1b4b;margin-bottom:20px;">
        <tbody>
          ${infoRow('Ticket ID', `<span style="font-family:monospace;color:#818cf8;">${ticketId}</span>`)}
          ${infoRow('User Email', userEmail)}
          ${infoRow('Category', category)}
        </tbody>
      </table>
      <div style="background:#0d0d1c;border-left:3px solid #f59e0b;padding:16px 20px;border-radius:6px;margin-bottom:28px;">
        <p style="margin:0;font-size:13px;color:#d1d5db;line-height:1.7;">${message}</p>
      </div>
      ${ctaButton('View in Admin Panel', 'https://resumeforgeai.in/admin/support', '#d97706')}
    `);

    await sendEmail({
        to: [{ email: adminEmail, name: 'ResumeForgeAI Admin' }],
        subject: `🚨 New Ticket ${ticketId} — ${category}`,
        html,
    });
}
