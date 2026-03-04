'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, CreditCard, Shield, Clock, Zap, Crown, CheckCircle, ArrowLeft, Tag, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

// ── Plan definitions ──────────────────────────────────────────────────────────
type PlanName = 'PRO' | 'PREMIUM' | 'CAREER';

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
    PRO: {
        label: 'Pro',
        price: 29,
        priceLabel: '₹29',
        description: '24-hour unlimited access',
        features: [
            'Unlimited resumes (24h)',
            'Unlimited cover letters (24h)',
            'Unlimited mock tests (24h)',
            'No watermarks',
        ],
        icon: <Zap className="w-5 h-5" />,
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/40',
    },
    PREMIUM: {
        label: 'Premium',
        price: 199,
        priceLabel: '₹199/mo',
        description: 'Monthly subscription with generous limits',
        features: [
            '10 resumes/day',
            '10 cover letters/day',
            '10 mock tests/day',
            'No watermarks',
        ],
        icon: <Crown className="w-5 h-5" />,
        gradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/40',
    },
    CAREER: {
        label: 'Career',
        price: 499,
        priceLabel: '₹499/mo',
        description: 'Unlimited monthly access — for serious job seekers',
        features: [
            'Unlimited resumes',
            'Unlimited cover letters',
            'Unlimited mock tests',
            'Priority AI processing',
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
export default function BillingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawPlan = (searchParams.get('plan') ?? 'PRO').toUpperCase() as PlanName;
    const plan = PLANS[rawPlan] ? rawPlan : 'PRO';
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

    // Derived pricing
    const basePrice = planInfo.price;
    const finalPrice = couponResult?.valid ? (couponResult.finalPrice ?? basePrice) : basePrice;
    const discountAmount = couponResult?.valid ? (couponResult.discountAmount ?? 0) : 0;
    const isFree = couponResult?.valid && couponResult.isFree === true;

    // Load Razorpay script once
    useEffect(() => {
        if (razorpayScriptLoaded.current) return;
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        razorpayScriptLoaded.current = true;
    }, []);

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
                body: JSON.stringify({ code, plan_price: basePrice }),
            });
            const data: CouponResult = await res.json();
            setCouponResult(data);
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
                router.push('/dashboard?payment=success');
                return;
            }

            // ── RAZORPAY PATH: price > 0 ─────────────────────────────────────
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    // Pass coupon code so backend re-validates and applies discount to Razorpay amount
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
                router.push('/dashboard?payment=success');
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
                            return;
                        }
                        router.push('/dashboard?payment=success');
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
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-10">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* ── Left: Plan Summary ── */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Complete your purchase
                            </h1>
                            <p className="text-slate-400 mt-2">You&apos;re just one step away from unlocking your plan.</p>
                        </div>

                        {/* Plan card */}
                        <div className={`p-6 rounded-2xl bg-gradient-to-br ${planInfo.gradient} border ${planInfo.border} backdrop-blur-sm`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    {planInfo.icon}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{planInfo.label} Plan</h2>
                                    <p className="text-slate-400 text-sm">{planInfo.description}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    {discountAmount > 0 ? (
                                        <div>
                                            <div className="text-slate-400 line-through text-sm">₹{basePrice}</div>
                                            <div className="text-2xl font-bold text-emerald-400">
                                                {finalPrice === 0 ? 'Free' : `₹${finalPrice}`}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold">{planInfo.priceLabel}</div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {planInfo.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price breakdown (when coupon applied) */}
                        {couponResult?.valid && (
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Original price</span>
                                    <span className="text-slate-300">₹{basePrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Coupon ({couponResult.code}) — {couponResult.discountLabel}
                                    </span>
                                    <span className="text-emerald-400">−₹{discountAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-emerald-500/20 pt-2">
                                    <span>Total</span>
                                    <span className={finalPrice === 0 ? 'text-emerald-400' : 'text-white'}>
                                        {finalPrice === 0 ? 'Free' : `₹${finalPrice}`}
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
                                <div key={text} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-1 text-center">
                                    <div className="text-indigo-400">{icon}</div>
                                    <span className="text-xs text-slate-400">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Plan switcher */}
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                            <p className="text-sm text-slate-400 mb-3">Switch plan</p>
                            <div className="flex gap-2 flex-wrap">
                                {(Object.keys(PLANS) as PlanName[]).map((p) => (
                                    <Link
                                        key={p}
                                        href={`/billing?plan=${p}`}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${p === plan ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {PLANS[p].label} — {PLANS[p].priceLabel}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Billing Form ── */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                            Billing Details
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                                    <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Arjun Sharma"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="arjun@email.com"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>

                            {/* Phone + Company */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Company Name <span className="text-slate-600">(optional)</span></label>
                                    <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Acme Corp"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>

                            {/* Country + State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">Country</label>
                                    <input name="country" value={form.country} onChange={handleChange} placeholder="India"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">State</label>
                                    <input name="state" value={form.state} onChange={handleChange} placeholder="Telangana"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>

                            {/* City + ZIP */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">City</label>
                                    <input name="city" value={form.city} onChange={handleChange} placeholder="Hyderabad"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5">ZIP / Postal Code</label>
                                    <input name="zip_code" value={form.zip_code} onChange={handleChange} placeholder="500001"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Billing Address</label>
                                <textarea name="address" value={form.address} onChange={handleChange}
                                    placeholder="Flat 101, Building Name, Street, Area" rows={2}
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                            </div>

                            {/* Geolocation */}
                            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-300">Location</p>
                                            <p className="text-xs text-slate-500">
                                                {geoStatus === 'granted'
                                                    ? `✓ Captured (${geo.latitude?.toFixed(4)}, ${geo.longitude?.toFixed(4)})`
                                                    : geoStatus === 'denied'
                                                        ? 'Permission denied'
                                                        : 'Optional — helps us serve you better'}
                                            </p>
                                        </div>
                                    </div>
                                    {geoStatus !== 'granted' && (
                                        <button type="button" onClick={requestGeo} disabled={geoStatus === 'requesting'}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-600/30 transition-all disabled:opacity-50 whitespace-nowrap">
                                            {geoStatus === 'requesting' ? 'Requesting…' : 'Allow'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Coupon Code ── */}
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                                <label className="block text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" /> Coupon Code
                                </label>

                                {couponResult?.valid ? (
                                    /* Applied coupon display */
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-emerald-400">{couponResult.code}</p>
                                                <p className="text-xs text-emerald-300/70 truncate">{couponResult.message}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRemoveCoupon}
                                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors shrink-0"
                                            aria-label="Remove coupon">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    /* Coupon input */
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value.toUpperCase());
                                                    if (couponResult) setCouponResult(null);
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                                                placeholder="Enter coupon code"
                                                className="flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors uppercase tracking-widest"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponInput.trim()}
                                                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                            >
                                                {couponLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : 'Apply'}
                                            </button>
                                        </div>

                                        {/* Coupon error */}
                                        {couponResult && !couponResult.valid && couponResult.error && (
                                            <p className="text-xs text-red-400 flex items-center gap-1">
                                                <X className="w-3 h-3" /> {couponResult.error}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Submit button ── */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] ${isFree
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50'
                                    } text-white`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing…
                                    </>
                                ) : isFree ? (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Activate Plan
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Pay ₹{finalPrice} securely
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-500">
                                {isFree
                                    ? 'Plan will be activated instantly — no payment required'
                                    : 'Secured by Razorpay · SSL encrypted · No card data stored'}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
