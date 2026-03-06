import { InvoiceRecord } from './invoice';
import { format } from 'date-fns';

export async function generateInvoiceHtml(invoice: InvoiceRecord, originalPricePaise: number, discountAmountPaise: number): Promise<string> {
    const isUSD = invoice.currency === 'USD';
    const symbol = isUSD ? '$' : '₹';
    const dec = isUSD ? 2 : 0;

    const formatAmt = (paise: number) => `${symbol}${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: 2 })}`;

    const subtotalStr = formatAmt(originalPricePaise);
    const discountStr = `-${formatAmt(discountAmountPaise)}`;
    const totalStr = formatAmt(invoice.amount);

    const dateStr = format(new Date(invoice.created_at), 'dd MMMM yyyy');
    const planLabel = invoice.plan.charAt(0) + invoice.plan.slice(1).toLowerCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Great+Vibes&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1e293b; line-height: 1.5; -webkit-font-smoothing: antialiased; }
    .invoice-container { max-width: 850px; margin: 0 auto; padding: 0; background: #fff; border: 1px solid #f1f5f9; }
    
    /* Header */
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 35px 50px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
    .header-logo { display:flex; align-items:center; gap:12px; }
    .logo-box { width:45px; height:45px; background: #6366f1; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:24px; color: #fff; }
    .brand-name { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header-title { font-size: 32px; font-weight: 800; opacity: 0.95; letter-spacing: 1px; }

    .content { padding: 40px 50px; }

    /* Info Blocks */
    .info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-bottom: 40px; }
    
    .platform-info { font-size: 14px; color: #64748b; }
    .platform-info strong { color: #1e293b; }
    .platform-info div { margin-bottom: 6px; }

    .meta-box { background: #f8fafc; border-radius: 16px; padding: 20px 24px; border: 1px solid #f1f5f9; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { color: #64748b; font-weight: 500; }
    .meta-val { color: #1e293b; font-weight: 700; text-align: right; }

    /* Box Containers */
    .boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
    .box { border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
    .box-head { background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
    .box-body { padding: 18px 20px; flex: 1; }
    
    .bill-to-name { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
    .bill-to-info { font-size: 13px; color: #64748b; margin-bottom: 2px; }

    .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .details-total { border-top: 2px solid #f1f5f9; margin-top: 12px; padding-top: 12px; color: #4f46e5; display: flex; justify-content: space-between; align-items: center; }
    .details-total span:first-child { font-weight: 700; font-size: 13px; text-transform: uppercase; }
    .details-total span:last-child { font-size: 18px; font-weight: 900; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 15px 20px; background: #f8fafc; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #f1f5f9; }
    td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; vertical-align: middle; }
    
    .item-desc { font-weight: 700; color: #1e293b; }

    /* Summary */
    .summary-section { width: 320px; margin-left: auto; margin-bottom: 60px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .summary-label { color: #64748b; font-weight: 500; }
    .summary-val { color: #1e293b; font-weight: 700; text-align: right; }
    .summary-total { margin-top: 20px; padding-top: 20px; border-top: 2.5px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 16px; font-weight: 800; color: #1e293b; }
    .total-val { font-size: 24px; font-weight: 900; color: #4f46e5; }

    /* Signatory and Stamp */
    .bottom-section { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 40px; border-top: 2px solid #f1f5f9; }
    
    .signature-area { width: 300px; }
    .sig-label { font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .signature-font { font-family: 'Great Vibes', cursive; font-size: 38px; color: #1e293b; margin-bottom: 4px; opacity: 0.9; }
    .sig-name { font-size: 15px; font-weight: 800; color: #1e293b; }
    .sig-title { font-size: 12px; color: #64748b; font-weight: 500; }

    /* Official Stamp SVG */
    .stamp-container { position: relative; width: 150px; height: 150px; }
    .stamp-svg { width: 100%; height: 100%; }

    .footer-note { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; font-weight: 500; }

    @media print {
      body { background: #fff; }
      .invoice-container { border: none; max-width: 100%; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="header-logo">
        <div class="logo-box">T</div>
        <div class="brand-name">ResumeForgeAI</div>
      </div>
      <div class="header-title">Invoice</div>
    </div>

    <div class="content">
      <div class="info-grid">
        <div class="platform-info">
          <div><strong>Platform -</strong> ResumeForgeAI</div>
          <div><strong>Email -</strong> support@resumeforgeai.in</div>
          <div><strong>Website -</strong> resumeforgeai.in</div>
        </div>
        <div class="meta-box">
          <div class="meta-row">
            <span class="meta-label">Invoice Number</span>
            <span class="meta-val">#${invoice.invoice_number.includes('INV-') ? invoice.invoice_number.replace('INV-', 'RF') : invoice.invoice_number}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Invoice Date</span>
            <span class="meta-val">${dateStr}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Payment ID</span>
            <span class="meta-val" style="font-family:monospace;font-size:11px;">${invoice.razorpay_payment_id || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Customer ID</span>
            <span class="meta-val">CU${invoice.user_id.slice(0, 6).toUpperCase()}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Payment Method</span>
            <span class="meta-val">${invoice.payment_method === 'razorpay' ? 'Razorpay' : 'Coupon'}</span>
          </div>
        </div>
      </div>

      <div class="boxes">
        <div class="box">
          <div class="box-head">Bill To:</div>
          <div class="box-body">
            <div class="bill-to-name">${invoice.billing_name || 'Valued User'}</div>
            <div class="bill-to-info">${invoice.billing_email || ''}</div>
            <div class="bill-to-info">${invoice.billing_phone || ''}</div>
          </div>
        </div>
        <div class="box">
          <div class="box-head">Invoice Details</div>
          <div class="box-body">
            <div class="details-row">
              <span class="meta-label">Plan</span>
              <span class="meta-val">${planLabel} Plan</span>
            </div>
            <div class="details-row">
              <span class="meta-label">Region</span>
              <span class="meta-val">${invoice.billing_country || 'India'}</span>
            </div>
            <div class="details-row">
              <span class="meta-label">Currency</span>
              <span class="meta-val">${invoice.currency || 'INR'}</span>
            </div>
            <div class="details-total">
               <span>Total Amount</span>
               <span>${totalStr}</span>
            </div>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40%">Description</th>
            <th style="text-align:center">Plan</th>
            <th style="text-align:center">Price</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-desc">ResumeForgeAI - ${planLabel} Plan</div>
            </td>
            <td style="text-align:center">1 Month</td>
            <td style="text-align:center">${subtotalStr}</td>
            <td style="text-align:center">1</td>
            <td style="text-align:right; font-weight:700">${subtotalStr}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-val">${subtotalStr}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Coupon Discount</span>
          <span class="summary-val" style="color: #16a34a">${discountStr}</span>
        </div>
        <div class="summary-total">
          <span class="total-label">Total Amount Due</span>
          <span class="total-val">${totalStr}</span>
        </div>
      </div>

      <div class="bottom-section">
        <div class="signature-area">
          <div class="sig-label">Authorized Signatory</div>
          <div class="signature-font">Sai Varsith</div>
          <div class="sig-name">Sai Varsith</div>
          <div class="sig-title">Founder & Owner, ResumeForgeAI</div>
        </div>
        <div class="stamp-container">
           <svg class="stamp-svg" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="none" stroke="#4f46e5" stroke-width="2" />
             <circle cx="50" cy="50" r="42" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="2,2" />
             <path id="curve" d="M 20,50 A 30,30 0 1,1 80,50" fill="transparent" />
             <text fill="#4f46e5" font-size="7" font-weight="900" letter-spacing="1">
               <textPath xlink:href="#curve" startOffset="50%" text-anchor="middle">RESUMEFORGEAI</textPath>
             </text>
             <circle cx="50" cy="45" r="15" fill="#4f46e5" opacity="0.1" />
             <path d="M 35,50 L 45,60 L 65,40" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
             <rect x="25" y="65" width="50" height="15" rx="2" fill="#4f46e5" />
             <text x="50" y="75" fill="white" font-size="5" font-weight="900" text-anchor="middle">OFFICIAL BILLING</text>
             <text x="50" y="24" fill="#4f46e5" font-size="6">★★★★★</text>
           </svg>
        </div>
      </div>

      <div class="footer-note">
        This is a system-generated invoice and does not require a physical signature.
      </div>
    </div>
  </div>
</body>
</html>`;
}
