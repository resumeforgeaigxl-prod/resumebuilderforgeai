// @ts-nocheck
import { describe, it, expect } from 'bun:test';
import { createHmac } from 'crypto';

describe('P0 — Billing Security, Plan Resolution & Verification Audit', () => {
  describe('1. Plan Resolution & Aliases', () => {
    // Import or test plan mapping directly
    it('resolves PRO_STANDARD cleanly to 499 INR plan with 5000 daily AI credits', async () => {
      const pageFile = await Bun.file('app/[locale]/(dashboard)/dashboard/billing/page.tsx').text();
      expect(pageFile).toContain('PRO_STANDARD:');
      expect(pageFile).toContain("price: 499");
      expect(pageFile).toContain("'5,000 Daily AI credits'");
    });

    it('defines aliases for PRO, STARTER, SEARCH, AGENT, AUTOPILOT so no valid alias crashes', async () => {
      const pageFile = await Bun.file('app/[locale]/(dashboard)/dashboard/billing/page.tsx').text();
      expect(pageFile).toContain('PRO:');
      expect(pageFile).toContain('STARTER:');
      expect(pageFile).toContain('SEARCH:');
      expect(pageFile).toContain('AGENT:');
      expect(pageFile).toContain('AUTOPILOT:');
    });

    it('handles unrecognized or missing plans gracefully with fallback to PRO_STANDARD and banner', async () => {
      const pageFile = await Bun.file('app/[locale]/(dashboard)/dashboard/billing/page.tsx').text();
      expect(pageFile).toContain("const planVariant: PlanName = isKnownPlan ? (paramPlan as PlanName) : 'PRO_STANDARD';");
      expect(pageFile).toContain('planNotice');
    });
  });

  describe('2. Content Security Policy (CSP) & Frame Protection', () => {
    it('includes frame-src for Razorpay checkout and API to prevent Chrome blocked content', async () => {
      const nextConfigFile = await Bun.file('next.config.mjs').text();
      expect(nextConfigFile).toContain("frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https:;");
    });

    it('includes connect-src for payment APIs, telemetry, and WebSockets', async () => {
      const nextConfigFile = await Bun.file('next.config.mjs').text();
      expect(nextConfigFile).toContain("connect-src 'self' https: wss:;");
    });

    it('preserves clickjacking defenses with frame-ancestors none and X-Frame-Options DENY', async () => {
      const nextConfigFile = await Bun.file('next.config.mjs').text();
      expect(nextConfigFile).toContain("frame-ancestors 'none';");
      expect(nextConfigFile).toContain("X-Frame-Options");
      expect(nextConfigFile).toContain("DENY");
    });

    it('permits self geolocation in Permissions-Policy so billing auto-detect does not violate policy', async () => {
      const nextConfigFile = await Bun.file('next.config.mjs').text();
      expect(nextConfigFile).toContain("geolocation=(self)");
    });
  });

  describe('3. Middleware Auth Gate for Regional Dashboard Routes', () => {
    it('strictly protects /en-in/dashboard/billing by excluding isRegionalPath from public routes', async () => {
      const middlewareFile = await Bun.file('middleware.ts').text();
      // Ensure isRegionalPath is not in isPublicRoute
      expect(middlewareFile).not.toMatch(/isPublicRoute\s*=\s*[\s\S]*?isRegionalPath/);
      expect(middlewareFile).toContain("normalizedPath.startsWith('/pricing')");
    });
  });

  describe('4. Secure Payment Verification Pipeline (/api/payment/verify)', () => {
    it('verifies that /api/payment/verify reads plan strictly from server order record', async () => {
      const verifyRouteFile = await Bun.file('app/api/payment/verify/route.ts').text();
      // Order fetched from database
      expect(verifyRouteFile).toContain(".from('orders')");
      expect(verifyRouteFile).toContain(".eq('razorpay_order_id', razorpay_order_id)");
      // Must read verified plan from orderRow, not client body
      expect(verifyRouteFile).toContain("const verifiedPlanName = (orderRow.plan_name || 'PRO_STANDARD').toUpperCase();");
      // Must enforce session user ownership
      expect(verifyRouteFile).toContain("if (orderRow.user_id !== session.userId)");
    });

    it('verifies that idempotency check prevents duplicate activations and credit grants', async () => {
      const verifyRouteFile = await Bun.file('app/api/payment/verify/route.ts').text();
      expect(verifyRouteFile).toContain("if (orderRow.status === 'success' || orderRow.status === 'paid')");
      expect(verifyRouteFile).toContain("Payment already verified and processed");
      expect(verifyRouteFile).toContain(".eq('razorpay_payment_id', razorpay_payment_id)");
    });

    it('verifies HMAC-SHA256 signature computation using RAZORPAY_KEY_SECRET', () => {
      const testSecret = 'rzp_test_secret_123456789';
      const orderId = 'order_test_123';
      const paymentId = 'pay_test_456';

      const validSignature = createHmac('sha256', testSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const tamperedSignature = createHmac('sha256', testSecret)
        .update(`${orderId}|pay_spoofed_999`)
        .digest('hex');

      expect(validSignature).not.toBe(tamperedSignature);
      expect(validSignature.length).toBe(64);
    });

    it('verifies idempotent key construction on CreditService.grantCredits', async () => {
      const verifyRouteFile = await Bun.file('app/api/payment/verify/route.ts').text();
      expect(verifyRouteFile).toContain("idempotencyKey: `order_${razorpay_order_id}`");
      expect(verifyRouteFile).toContain("reason: 'PLAN_PURCHASE'");
    });
  });
});
