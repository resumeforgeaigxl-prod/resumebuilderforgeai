export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

function isAdminUser(session: any): boolean {
  return session?.role === 'admin' || session?.email === 'saivarshith8284@gmail.com';
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient();

    // Query all requests
    const { data: requests, error: reqErr } = await supabase
      .from('project_requests')
      .select('*');

    if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

    // Query paid/unpaid invoices for revenue
    const { data: invoices, error: invErr } = await supabase
      .from('project_invoices')
      .select('*');

    if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

    // Calculate core metrics
    const stats = {
      total: 0,
      new: 0,
      pendingReview: 0,
      quotationSent: 0,
      awaitingPayment: 0,
      inDevelopment: 0,
      testing: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
      pendingRevenue: 0
    };

    requests.forEach((r: any) => {
      stats.total++;
      if (r.status === 'Pending') stats.new++;
      if (r.status === 'Under Review' || r.status === 'Pending') stats.pendingReview++;
      if (r.status === 'Quotation Sent') stats.quotationSent++;
      if (r.status === 'Awaiting Payment') stats.awaitingPayment++;
      if (r.status === 'In Progress') stats.inDevelopment++;
      if (r.status === 'Testing') stats.testing++;
      if (r.status === 'Delivered') stats.delivered++;
      if (r.status === 'Completed') stats.completed++;
      if (r.status === 'Cancelled') stats.cancelled++;
    });

    invoices.forEach((inv: any) => {
      const amt = Number(inv.amount) || 0;
      if (inv.status === 'paid') {
        stats.revenue += amt;
      } else if (inv.status === 'unpaid') {
        stats.pendingRevenue += amt;
      }
    });

    // Chart: Status distribution
    const statusDistribution = requests.reduce((acc: any, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Chart: Domain counts
    const domainCounts = requests.reduce((acc: any, r: any) => {
      acc[r.project_domain] = (acc[r.project_domain] || 0) + 1;
      return acc;
    }, {});

    // Chart: Technology counts
    const techCounts: Record<string, number> = {};
    requests.forEach((r: any) => {
      const list = [
        r.tech_frontend, r.tech_backend, r.tech_database, 
        r.tech_language, r.tech_ai_framework, r.tech_hosting
      ].filter(Boolean);
      list.forEach((t: string) => {
        const clean = t.trim();
        techCounts[clean] = (techCounts[clean] || 0) + 1;
      });
    });

    // Chart: Requests by month
    const requestsByMonth: Record<string, number> = {};
    const revenueByMonth: Record<string, number> = {};

    requests.forEach((r: any) => {
      const date = new Date(r.created_at);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      requestsByMonth[key] = (requestsByMonth[key] || 0) + 1;
    });

    invoices.forEach((inv: any) => {
      if (inv.status === 'paid') {
        const date = new Date(inv.created_at);
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(inv.amount);
      }
    });

    return NextResponse.json({
      success: true,
      stats,
      charts: {
        statusDistribution,
        domainCounts,
        techCounts,
        requestsByMonth,
        revenueByMonth
      }
    });
  } catch (err: any) {
    console.error('[Admin Stats API Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
