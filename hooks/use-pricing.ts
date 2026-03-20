'use client';

import { useState, useEffect } from 'react';
import { PlanConfig, PLANS } from '@/lib/pricing/config';

export function usePricing() {
    const [status, setStatus] = useState<{
        plan: PlanConfig;
        creditsRemaining: number;
        jobViewsRemaining: number;
        isLoading: boolean;
    }>({
        plan: PLANS.free,
        creditsRemaining: 0,
        jobViewsRemaining: 0,
        isLoading: true,
    });

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/user/pricing-status');
            if (res.ok) {
                const data = await res.json();
                setStatus({
                    plan: PLANS[data.planId as keyof typeof PLANS] || PLANS.free,
                    creditsRemaining: data.creditsRemaining,
                    jobViewsRemaining: data.jobViewsRemaining,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error('Failed to fetch pricing status:', error);
            setStatus(prev => ({ ...prev, isLoading: false }));
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const checkAccess = (task: string) => {
        if (status.isLoading) return true; // Optimistic
        const forgeAccess = (status.plan.features.forges as any)[task];
        return forgeAccess !== 'locked';
    };

    return { ...status, checkAccess, refresh: fetchStatus };
}
