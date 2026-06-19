'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, CreditCard, Shield, Clock, Zap, Crown, CheckCircle, ArrowLeft, Tag, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { PLANS as CONFIG_PLANS } from '@/lib/pricing/config';

// ── Plan definitions ──────────────────────────────────────────────────────────
type PlanName = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PROFESSIONAL';

const PLANS: Record<PlanName, {
    label: string;
    price: number;
    priceLabel: string;
    description: string;
    features: string[];
    icon: React.ReactNode;
    gradient: string;
    border: string;
}> = {
    DAILY: {
        label: 'Daily',
        price: CONFIG_PLANS.daily.price,
        priceLabel: `₹${CONFIG_PLANS.daily.price}`,
        description: '24-hour unlimited access',
        features: [
            '300 Daily AI credits',
            'Full ResumeForge access',
            '24-hour validity',
            'No watermarks',
        ],
        icon: <Zap className="w-5 h-5" />,
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/40',
    },
    WEEKLY: {
        label: 'Weekly',
        price: CONFIG_PLANS.weekly.price,
        priceLabel: `₹${CONFIG_PLANS.weekly.price}`,
        description: '7-day career sprint',
        features: [
            '800 Daily AI credits',
            'Everything in Daily',
            'InterviewForge access',
            '7-day validity',
        ],
        icon: <Zap className="w-5 h-5" />,
        gradient: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/40',
    },
    MONTHLY: {
        label: 'Monthly',
        price: CONFIG_PLANS.monthly.price,
        priceLabel: `₹${CONFIG_PLANS.monthly.price}/mo`,
        description: 'Monthly subscription with generous limits',
        features: [
            '2000 Daily AI credits',
            'Full Advanced AI Forges',
            'Everything in Weekly',
            '30-day validity',
        ],
        icon: <Crown className="w-5 h-5" />,
        gradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/40',
    },
    PROFESSIONAL: {
        label: 'Professional',
        price: CONFIG_PLANS.pro.price,
        priceLabel: `₹${CONFIG_PLANS.pro.price}/mo`,
        description: 'Unlimited monthly access — for serious job seekers',
        features: [
            '5000 Daily AI credits',
            'All AI Forges + Mentor AI',
            'Priority Support',
            '30-day validity',
        ],
        icon: <Crown className="w-5 h-5 text-yellow-400" />,
        gradient: 'from-amber-500/20 to-orange-500/20',
        border: 'border-amber-500/40',
    },
};


// Razorpay types
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

interface CouponResult {
    valid: boolean;
    code?: string;
    couponType?: string;
    discountAmount?: number;
    discountLabel?: string;
    finalPrice?: number;
    isFree?: boolean;
    message?: string;
    error?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
function BillingContent({ params }: { params: { locale: string } }) {
    const { locale } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawPlan = ((searchParams?.get('plan') ?? 'MONTHLY').toUpperCase() as PlanName);
    const plan = PLANS[rawPlan] ? rawPlan : 'MONTHLY';
    const planInfo = PLANS[plan];

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        city: '',
        zip_code: '',
        address: '',
        company_name: '',
    });

    // ── Localized pricing state ──────────────────────────────────────────────
    const [priceConfig, setPriceConfig] = useState<{
        countryCode: string;
        currency: string;
        symbol: string;
        prices: Record<string, number>;
    } | null>(null);

    const [geo, setGeo] = useState<{ latitude: number | null; longitude: number | null }>({
        latitude: null,
        longitude: null,
    });

    const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponResult, setCouponResult] = useState<CouponResult | null>(null);

    const razorpayScriptLoaded = useRef(false);

    // Load Price Config + Razorpay script
    useEffect(() => {
        // 1. Fetch Price/Country config
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/payment/config');
                const data = await res.json();
                setPriceConfig(data);
                if (data.countryCode && !form.country) {
                    setForm(f => ({ ...f, country: data.countryCode === 'IN' ? 'India' : data.countryCode }));
                }
            } catch (e) { console.error('Failed to fetch pricing config:', e); }
        };
        fetchConfig();

        // 2. Razorpay script
        if (razorpayScriptLoaded.current) return;
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        razorpayScriptLoaded.current = true;
    }, [form.country]);

    // Derived pricing using dynamic config
    const currentPrice = priceConfig?.prices[plan.toLowerCase()] || planInfo.price;
    const currentSymbol = priceConfig?.symbol || '₹';

    const basePrice = currentPrice;
    const finalPrice = couponResult?.valid ? (couponResult.finalPrice ?? basePrice) : basePrice;
    const discountAmount = couponResult?.valid ? (couponResult.discountAmount ?? 0) : 0;
    const isFree = couponResult?.valid && couponResult.isFree === true;

    const requestGeo = () => {
        if (!navigator.geolocation) { setGeoStatus('denied'); return; }
        setGeoStatus('requesting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeo({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setGeoStatus('granted');
            },
            () => setGeoStatus('denied'),
            { timeout: 8000 }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── Coupon apply ──────────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        const code = couponInput.trim();
        if (!code) return;
        setCouponLoading(true);
        setCouponResult(null);

        try {
            const res = await fetch('/api/payment/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, plan_price: basePrice, plan_name: plan.toLowerCase() }),
            });
            const data: CouponResult = await res.json();
            setCouponResult(data);
            if (data.valid) {
                try {
                    const posthog = (await import('@/lib/posthog')).default;
                    posthog.capture('coupon_applied', {
                        coupon_code: code,
                        plan_name: plan,
                        discount_amount: data.discountAmount
                    });
                } catch (e) { console.error('[PostHog] Event error:', e); }
            }
        } catch {
            setCouponResult({ valid: false, error: 'Failed to validate coupon. Try again.' });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponResult(null);
        setCouponInput('');
    };

    // ── Form submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const posthog = (await import('@/lib/posthog')).default;
            posthog.capture('payment_started', {
                plan_name: plan,
                coupon_code: couponResult?.code
            });
        } catch (e) { console.error('[PostHog] Event error:', e); }

        try {
            // 1. Save billing details
            const billingRes = await fetch('/api/payment/save-billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ...geo }),
            });
            if (!billingRes.ok) {
                const d = await billingRes.json();
                throw new Error(d.error ?? 'Failed to save billing details');
            }

            // ── COUPON PATH: price = 0 → skip Razorpay ──────────────────────
            if (isFree && couponResult?.code) {
                const activateRes = await fetch('/api/payment/activate-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        coupon_code: couponResult.code,
                        plan_name: plan,
                        billing_address: form.address
                            ? `${form.address}, ${form.city}, ${form.state} ${form.zip_code}, ${form.country}`.trim()
                            : null,
                    }),
                });
                if (!activateRes.ok) {
                    const d = await activateRes.json();
                    throw new Error(d.error ?? 'Failed to activate plan via coupon');
                }
                router.push(`/${locale}/dashboard?payment=success`);
                return;
            }

            // ── RAZORPAY PATH: price > 0 ─────────────────────────────────────
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    coupon_code: couponResult?.valid && couponResult.code ? couponResult.code : undefined,
                }),
            });
            if (!orderRes.ok) {
                const d = await orderRes.json();
                throw new Error(d.error ?? 'Failed to create payment order');
            }
            const orderData = await orderRes.json();

            // Safety net: if backend says it's free, redirect to activate-coupon
            if (orderData.isFree && couponResult?.code) {
                const activateRes = await fetch('/api/payment/activate-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        coupon_code: couponResult.code,
                        plan_name: plan,
                    }),
                });
                if (!activateRes.ok) {
                    const d = await activateRes.json();
                    throw new Error(d.error ?? 'Failed to activate plan via coupon');
                }
                router.push(`/${locale}/dashboard?payment=success`);
                return;
            }

            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please refresh and try again.');
            }

            const rzp = new window.Razorpay({
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'ResumeForge AI',
                description: `${planInfo.label} Plan`,
                order_id: orderData.orderId,
                prefill: {
                    name: form.full_name,
                    email: form.email,
                    contact: form.phone,
                },
                theme: { color: '#6366f1' },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_name: plan,
                            }),
                        });
                        if (!verifyRes.ok) {
                            const d = await verifyRes.json();
                            setError(d.error ?? 'Payment verification failed');
                            setLoading(false);
                            try {
                                const posthog = (await import('@/lib/posthog')).default;
                                posthog.capture('payment_failed', {
                                    plan_name: plan,
                                    error: d.error || 'Verification failed'
                                });
                            } catch (e) { console.error('[PostHog] Event error:', e); }
                            return;
                        }
                        try {
                            const posthog = (await import('@/lib/posthog')).default;
                            posthog.capture('payment_completed', {
                                plan_name: plan,
                                coupon_code: couponResult?.code
                            });
                        } catch (e) { console.error('[PostHog] Event error:', e); }
                        router.push(`/${locale}/dashboard?payment=success`);
                    } catch {
                        setError('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            });

            rzp.open();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
            <div className="relative max-w-5xl mx-auto px-4 py-10 animate-premium-in">
                <Link href="/" className="inline-flex items-center gap-2 text-[#8F8F8F] hover:text-[#171717] transition-colors mb-8 text-xs font-semibold uppercase tracking-wider font-mono">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* ── Left: Plan Summary ── */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">
                                Complete your purchase
                            </h1>
                            <p className="text-[#4D4D4D] mt-2 text-sm">You&apos;re just one step away from unlocking your plan.</p>
                        </div>

                        {/* Plan card */}
                        <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center">
                                    <div className="text-[#171717]">{planInfo.icon}</div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold text-base text-[#171717] leading-tight">{planInfo.label} Plan</h2>
                                    <p className="text-[#8F8F8F] text-xs mt-0.5 truncate">{planInfo.description}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    {discountAmount > 0 ? (
                                        <div>
                                            <div className="text-[#8F8F8F] line-through text-xs font-medium">{currentSymbol}{basePrice}</div>
                                            <div className="text-2xl font-bold text-emerald-600 leading-none">
                                                {finalPrice === 0 ? 'Free' : `${currentSymbol}${finalPrice}`}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold text-[#171717]">{currentSymbol}{currentPrice}</div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3">
                                {planInfo.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-xs text-[#4D4D4D]">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price breakdown (when coupon applied) */}
                        {couponResult?.valid && (
                            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-[#171717] space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#4D4D4D]">Original price</span>
                                    <span className="text-[#171717]">{currentSymbol}{basePrice}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                                        <Tag className="w-3 h-3" /> Coupon ({couponResult.code}) — {couponResult.discountLabel}
                                    </span>
                                    <span className="text-emerald-700 font-semibold">−{currentSymbol}{discountAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-emerald-200 pt-2 text-base">
                                    <span>Total</span>
                                    <span className={finalPrice === 0 ? 'text-emerald-700' : 'text-[#171717]'}>
                                        {finalPrice === 0 ? 'Free' : `${currentSymbol}${finalPrice}`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: <Shield className="w-4 h-4" />, text: 'Secure Payment' },
                                { icon: <CreditCard className="w-4 h-4" />, text: 'Razorpay Powered' },
                                { icon: <Clock className="w-4 h-4" />, text: 'Instant Activation' },
                            ].map(({ icon, text }) => (
                                <div key={text} className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] flex flex-col items-center gap-1.5 text-center shadow-sm">
                                    <div className="text-[#171717]">{icon}</div>
                                    <span className="text-[10px] text-[#4D4D4D] leading-tight font-medium">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Plan switcher */}
                        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                            <p className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono mb-3">Switch plan</p>
                            <div className="flex gap-2 flex-wrap">
                                {(Object.keys(PLANS) as PlanName[]).map((p) => (
                                    <Link
                                        key={p}
                                        href={`/${locale}/dashboard/billing?plan=${p}`}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${p === plan 
                                            ? 'bg-[#171717] border-[#171717] text-white shadow-sm' 
                                            : 'bg-[#FAFAFA] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]/80'
                                            }`}
                                    >
                                        {PLANS[p].label} — {currentSymbol}{priceConfig?.prices[p.toLowerCase()] || PLANS[p].price}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Billing Form ── */}
                    <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm self-start">
                        <h2 className="text-base font-semibold mb-5 flex items-center gap-2 text-[#171717]">
                            <CreditCard className="w-4.5 h-4.5 text-[#171717]" />
                            Billing Details
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Full Name *</label>
                                    <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Arjun Sharma"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Email *</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="arjun@email.com"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                            </div>

                            {/* Phone + Company */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Phone</label>
                                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Company <span className="text-[#8F8F8F]">(opt)</span></label>
                                    <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Acme Corp"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                            </div>

                            {/* Country + State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Country</label>
                                    <input name="country" value={form.country} onChange={handleChange} placeholder="India"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">State</label>
                                    <input name="state" value={form.state} onChange={handleChange} placeholder="Telangana"
                                        className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all" />
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider mb-1.5 font-mono">Address</label>
                                <textarea name="address" value={form.address} onChange={handleChange}
                                    placeholder="Flat 101, Building Name, Street" rows={2}
                                    className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all resize-none" />
                            </div>

                            {/* Geolocation */}
                            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB]">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] flex items-center justify-center shadow-sm">
                                            <MapPin className="w-4 h-4 text-[#171717] shrink-0" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#171717]">Location Access</p>
                                            <p className="text-[10px] text-[#8F8F8F]">
                                                {geoStatus === 'granted'
                                                    ? `✓ Detected (${geo.latitude?.toFixed(2)}, ${geo.longitude?.toFixed(2)})`
                                                    : geoStatus === 'denied'
                                                        ? 'Permission denied'
                                                        : 'Helps prevent processing errors'}
                                            </p>
                                        </div>
                                    </div>
                                    {geoStatus !== 'granted' && (
                                        <button type="button" onClick={requestGeo} disabled={geoStatus === 'requesting'}
                                            className="px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] text-xs font-semibold hover:bg-[#FAFAFA] transition-all disabled:opacity-50 whitespace-nowrap">
                                            {geoStatus === 'requesting' ? 'Requesting…' : 'Detect'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Coupon Code ── */}
                            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] space-y-3">
                                <label className="block text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wider flex items-center gap-2 font-mono">
                                    <Tag className="w-3.5 h-3.5 text-[#171717]" /> Coupon Discount
                                </label>

                                {couponResult?.valid ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider leading-none">{couponResult.code}</p>
                                                <p className="text-[10px] text-emerald-700/80 mt-1 truncate">{couponResult.message}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRemoveCoupon}
                                            className="p-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#8F8F8F] hover:text-[#171717] transition-all shrink-0"
                                            aria-label="Remove coupon">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value.toUpperCase());
                                                    if (couponResult) setCouponResult(null);
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                                                placeholder="Enter code"
                                                className="flex-1 px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] text-xs focus:outline-none focus:border-[#171717] transition-all uppercase tracking-[0.2em]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponInput.trim()}
                                                className="px-4 py-2 rounded-md bg-[#171717] hover:bg-[#333333] text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                            >
                                                {couponLoading ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : 'APPLY'}
                                            </button>
                                        </div>
                                        {couponResult && !couponResult.valid && couponResult.error && (
                                            <p className="text-xs text-red-600 flex items-center gap-1.5 px-1 font-semibold">
                                                <X className="w-3 h-3 text-red-600" /> {couponResult.error}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Submit button ── */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 rounded-md font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] mt-2 shadow-sm ${isFree
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-[#171717] hover:bg-[#333333] text-white'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing…
                                    </>
                                ) : isFree ? (
                                    <>
                                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                        Activate Plan
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Pay {currentSymbol}{finalPrice} Securely
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[9px] text-[#8F8F8F] uppercase tracking-wider font-bold font-mono">
                                {isFree
                                    ? 'Instant activation · Full access unlocked'
                                    : 'Secured by Razorpay · PCI DSS Compliant'}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BillingPage({ params }: { params: { locale: string } }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#EBEBEB] border-t-[#171717] rounded-full animate-spin" />
            </div>
        }>
            <BillingContent params={params} />
        </Suspense>
    );
}
