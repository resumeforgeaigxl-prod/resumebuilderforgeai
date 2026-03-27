'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForgeSoftPaywallProps {
  forgeName: string;
  onClose?: () => void;
}

export const ForgeSoftPaywall: React.FC<ForgeSoftPaywallProps> = ({ forgeName, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-lg bg-[#0f111a] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-[0_0_100px_-20px_rgba(59,130,246,0.5)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px]" />
        
        <div className="relative text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Lock size={32} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Unlock Full Access to {forgeName}
            </h2>
            <p className="text-lg text-slate-400 font-medium">
              You&apos;ve used your free attempts. Unlock full access to continue building your career ecosystem.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <Link 
              href="/en-in/pricing" 
              className="group flex items-center justify-center gap-3 bg-white text-black font-black py-5 px-8 rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
            >
              Upgrade Your Plan <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            
            {onClose && (
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Maybe Later
              </button>
            )}
          </div>

          <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <div className="flex flex-col items-center gap-2">
              <span className="text-blue-500/50">Ecosystem Access</span>
              <span>All 6 Forges</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-blue-500/50">Admin Support</span>
              <span>Priority Response</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
