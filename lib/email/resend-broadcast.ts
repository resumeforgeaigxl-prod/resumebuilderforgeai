import { BlogPost } from '@/lib/seo-service';

export interface SendBroadcastOptions {
  emails: string[];
  post: BlogPost;
}

export async function sendResendBlogBroadcast(options: SendBroadcastOptions) {
  const apiKey = process.env.RESEND_BLOG_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_BLOG_API_KEY environment variable.');
  }

  const { emails, post } = options;
  const baseUrl = 'https://resumeforgeai.in';

  // Construct HTML body with elegant and premium Vercel-like newsletter card styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${post.title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          background-color: #F9FAFB; 
          margin: 0; 
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background-color: #FFFFFF; 
          border: 1px solid #E2E8F0; 
          padding: 40px 30px; 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .logo { 
          font-size: 11px; 
          font-weight: 800; 
          text-transform: uppercase; 
          letter-spacing: 0.15em; 
          color: #4F46E5; 
          margin-bottom: 24px; 
          text-decoration: none; 
          display: block; 
          font-family: monospace;
        }
        .cover-image { 
          width: 100%; 
          max-width: 600px;
          height: auto; 
          border: 1px solid #E2E8F0; 
          margin-bottom: 30px; 
          display: block; 
        }
        .title { 
          font-size: 22px; 
          font-weight: 700; 
          color: #171717; 
          margin: 0 0 16px 0; 
          line-height: 1.3; 
          letter-spacing: -0.02em;
        }
        .author { 
          font-size: 10px; 
          color: #8F8F8F; 
          font-family: monospace; 
          text-transform: uppercase; 
          margin-bottom: 24px; 
          display: block; 
          letter-spacing: 0.05em;
        }
        .description { 
          font-size: 15px; 
          line-height: 1.6; 
          color: #4D4D4D; 
          margin: 0 0 32px 0; 
        }
        .cta-container {
          text-align: left;
        }
        .cta-button { 
          display: inline-block; 
          background-color: #171717; 
          color: #FFFFFF !important; 
          font-weight: 700; 
          font-size: 13px; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 4px; 
          transition: background-color 0.2s ease;
        }
        .footer { 
          margin-top: 40px; 
          border-top: 1px solid #E2E8F0; 
          padding-top: 24px; 
          font-size: 11px; 
          color: #8F8F8F; 
          text-align: center; 
          line-height: 1.6; 
        }
        .footer a { 
          color: #4F46E5; 
          text-decoration: none; 
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="${baseUrl}" class="logo">ResumeForgeAI News & Updates</a>
        
        ${post.cover_image ? `<img src="${baseUrl}${post.cover_image}" alt="${post.title}" class="cover-image">` : ''}
        
        <h1 class="title">${post.title}</h1>
        <span class="author">By ${post.author}</span>
        
        <p class="description">${post.seo_description}</p>
        
        <div class="cta-container">
          <a href="${baseUrl}/en-in/blogs/${post.slug}" class="cta-button">Read Article</a>
        </div>
        
        <div class="footer">
          You are receiving this because you subscribed to ResumeForgeAI updates.<br>
          <a href="${baseUrl}/en-in/unsubscribe">Unsubscribe</a> from these emails.
        </div>
      </div>
    </body>
    </html>
  `;

  // Format batch payload for Resend transactional batch endpoint
  const payload = emails.map(email => ({
    from: 'ResumeForgeAI Blogs <blogs@resumeforgeai.in>',
    to: email,
    subject: `New Post: ${post.title}`,
    html: htmlContent,
  }));

  console.log(`[Resend Broadcast] Dispatching batch of ${emails.length} emails via Resend...`);
  
  const response = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API batch error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`[Resend Broadcast] Successfully sent batch to ${emails.length} users.`, result);
  return result;
}
