'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';

export default function SetupUsernameClient({ locale }: { locale: string }) {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async () => {
    if (username.length < 3) return;
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/setup-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      } else {
        toast({ title: "Username set!", description: "You are being redirected to your dashboard." });
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-10 bg-white/[0.02] border-white/5 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Choose your username</h1>
          <p className="text-slate-500 text-sm">This will be your shareable portfolio URL.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <span className="text-[10px] text-slate-600">resumeforgeai.in/u/{username || '...'}</span>
            </div>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="johndoe"
              className="bg-white/5 border-white/10 text-white h-12 text-lg font-medium focus-visible:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button 
            onClick={handleSetup} 
            disabled={isChecking || username.length < 3}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold"
          >
            {isChecking ? "Checking..." : "Claim Username"}
          </Button>
        </div>

        <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest leading-loose">
          Allowed: a-z, 0-9, _ and - <br /> Length: 3–20 characters
        </p>
      </Card>
    </div>
  );
}
