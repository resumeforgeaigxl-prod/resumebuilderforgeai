'use client';

import React from 'react';
import { usePricing } from '@/hooks/use-pricing';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { UpgradeModal } from './UpgradeModal';

interface FeatureGateProps {
    task: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ task, children, fallback }) => {
    const { checkAccess, isLoading } = usePricing();
    const [showUpgrade, setShowUpgrade] = React.useState(false);

    const hasAccess = checkAccess(task);
    const lockedPreview = fallback ?? children;

    if (isLoading) return <div className="animate-pulse">{children}</div>;

    if (!hasAccess) {
        return (
            <div className="relative group">
                <div className="filter blur-[2px] pointer-events-none opacity-60">
                    {lockedPreview}
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpgrade(true)}
                        className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Unlock Feature</span>
                    </motion.button>
                </div>
                {showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
            </div>
        );
    }

    return <>{children}</>;
};
