'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from '@/components/icons';
import { PLANS, PlanID } from '@/lib/pricing/config';
import { useRouter, useParams } from 'next/navigation';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale || 'en-in';

    const handleUpgrade = (planId: PlanID) => {
        router.push(`/${locale}/dashboard/billing?plan=${planId}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#101010] border border-[#242424] text-[#F5F5F5] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515] rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold mb-2 text-[#F5F5F5]">Upgrade to Unlock Full Potential</h2>
                                <p className="text-[#7E7E7E]">Choose the plan that fits your career goals.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['daily', 'weekly', 'monthly'] as PlanID[]).map((planId) => {
                                    const plan = PLANS[planId];
                                    return (
                                        <div 
                                            key={planId}
                                            className="bg-[#151515] border border-[#242424] hover:border-[#8B5CF6]/50 rounded-xl p-6 flex flex-col h-full transition-colors cursor-pointer group"
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold text-[#F5F5F5]">{plan.name}</h3>
                                                <div className="text-2xl font-bold mt-2 text-[#F5F5F5]">
                                                    ₹{plan.price}
                                                    <span className="text-sm font-normal text-[#7E7E7E]"> / {planId === 'daily' ? 'day' : planId === 'weekly' ? 'week' : 'month'}</span>
                                                </div>
                                            </div>
                                            
                                            <ul className="space-y-3 mb-8 flex-grow">
                                                <li className="flex items-center gap-2 text-sm text-[#BDBDBD]">
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                    {plan.creditsPerDay} daily credits
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-[#BDBDBD]">
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                    Advanced AI Forges
                                                </li>
                                                {planId === 'monthly' && (
                                                    <li className="flex items-center gap-2 text-sm text-[#F5F5F5] font-medium">
                                                        <Zap className="w-4 h-4 text-[#8B5CF6]" />
                                                        Everything Unlocked
                                                    </li>
                                                )}
                                            </ul>

                                            <button 
                                                onClick={() => handleUpgrade(planId)}
                                                className="w-full py-2.5 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-[#7C3AED] transition-all shadow-lg active:scale-95 cursor-pointer"
                                            >
                                                Upgrade Now
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-10 p-6 bg-[#0A0A0A] rounded-xl border border-[#242424] text-center text-[#BDBDBD]">
                                <p className="text-sm font-medium">✨ Need everything + Mentor AI? Check out our <button onClick={() => handleUpgrade('pro')} className="text-[#8B5CF6] font-semibold hover:underline cursor-pointer">Professional Plan (₹499)</button></p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
