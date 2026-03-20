'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { PLANS, PlanID } from '@/lib/pricing/config';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold mb-2">Upgrade to Unlock Full Potential</h2>
                                <p className="text-zinc-500">Choose the plan that fits your career goals.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['daily', 'weekly', 'monthly'] as PlanID[]).map((planId) => {
                                    const plan = PLANS[planId];
                                    return (
                                        <div 
                                            key={planId}
                                            className="border dark:border-zinc-800 rounded-xl p-6 flex flex-col h-full hover:border-primary transition-colors cursor-pointer group"
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold">{plan.name}</h3>
                                                <div className="text-2xl font-bold mt-2">
                                                    ₹{plan.price}
                                                    <span className="text-sm font-normal text-zinc-500"> / {planId === 'daily' ? 'day' : planId === 'weekly' ? 'week' : 'month'}</span>
                                                </div>
                                            </div>
                                            
                                            <ul className="space-y-3 mb-8 flex-grow">
                                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    {plan.creditsPerDay} daily credits
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    Advanced AI Forges
                                                </li>
                                                {planId === 'monthly' && (
                                                    <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                                        <Zap className="w-4 h-4 text-amber-500" />
                                                        Everything Unlocked
                                                    </li>
                                                )}
                                            </ul>

                                            <button className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all">
                                                Upgrade Now
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-10 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                <p className="text-sm font-medium">✨ Need everything + Mentor AI? Check out our <span className="text-primary font-bold">Pro Plan (₹499)</span></p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
