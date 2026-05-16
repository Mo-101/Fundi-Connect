import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ExternalLink, RefreshCw, Wallet, Smartphone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  isMiniPayBrowser,
  isCeloWalletAvailable,
  connectMiniPay,
  getCKESBalance,
  sendAsanteDrop,
  celoExplorerTx,
  COMMUNITY_WALLET,
  type DonationResult,
} from '../lib/minipay';
import { PageContainer, PageHeader } from '../components/standard/AppShell';

type Step = 'pick' | 'confirm' | 'sending' | 'success' | 'failed';

const AMOUNTS = [10, 20, 50, 100]; // KES — voluntary, max 100

export default function AsanteDrop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('pick');
  const [selected, setSelected] = useState<number | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [result, setResult] = useState<DonationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const jobId = searchParams.get('jobId');
  const workerName = searchParams.get('worker') || 'the fundi';
  const miniPay = isMiniPayBrowser();
  const hasCelo = isCeloWalletAvailable();

  useEffect(() => {
    if (hasCelo) {
      connectMiniPay()
        .then(addr => {
          setWallet(addr);
          getCKESBalance(addr).then(bal => setBalance(parseFloat(bal).toFixed(2)));
        })
        .catch(() => {});
    }
  }, [hasCelo]);

  const handleConnect = async () => {
    try {
      const addr = await connectMiniPay();
      setWallet(addr);
      const bal = await getCKESBalance(addr);
      setBalance(parseFloat(bal).toFixed(2));
    } catch {
      setErrorMsg('Could not connect wallet. Open this page in MiniPay.');
    }
  };

  const handleDonate = async () => {
    if (!selected || !wallet) return;
    setStep('sending');
    try {
      const donation = await sendAsanteDrop(selected);

      // Record on server
      const userId = localStorage.getItem('mesh_user_id');
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `don_${Date.now()}`,
          jobId: jobId || null,
          donorAddress: donation.from,
          userId: userId || null,
          amountKES: donation.amount,
          txHash: donation.txHash,
          tokenSymbol: donation.tokenSymbol,
        }),
      });

      setResult(donation);
      setStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('rejected') || msg.includes('denied')) {
        setErrorMsg('You cancelled the transaction.');
      } else if (msg.includes('insufficient') || msg.includes('balance')) {
        setErrorMsg(`Not enough cKES. Top up your MiniPay wallet first.`);
      } else if (msg.includes('VITE_COMMUNITY_WALLET')) {
        setErrorMsg('Community wallet address not configured yet.');
      } else {
        setErrorMsg(msg);
      }
      setStep('failed');
    }
  };

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <PageContainer>
      <PageHeader title="Asante Drop." subtitle="Your drop keeps the mesh alive." />

      <div className="max-w-xl mx-auto py-8">
        <AnimatePresence mode="wait">

          {/* ── PICK AMOUNT ─────────────────────────────────────────────── */}
          {step === 'pick' && (
            <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">

              {/* Context banner */}
              <div className="bg-brand-red/5 border border-brand-red/10 rounded-[32px] p-6 text-center space-y-2">
                <Heart className="w-8 h-8 text-brand-red mx-auto fill-brand-red/20" />
                <p className="font-black text-stone-700 serif text-lg tracking-tight">Did {workerName} serve you well?</p>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                  Voluntary · KES 10–100 · 100% goes to platform survival
                </p>
              </div>

              {/* Wallet status */}
              {!hasCelo ? (
                <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-6 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-amber-800 text-sm">Open in MiniPay for instant cKES payment</p>
                    <p className="text-amber-600 text-xs mt-1">Download Opera Mini with MiniPay, or use the link: <span className="font-bold">minipay.opera.com</span></p>
                  </div>
                </div>
              ) : !wallet ? (
                <button onClick={handleConnect} className="w-full bg-stone-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-brand-red transition-all">
                  <Wallet className="w-5 h-5" />
                  Connect {miniPay ? 'MiniPay' : 'Celo Wallet'}
                </button>
              ) : (
                <div className="bg-white border-2 border-stone-100 rounded-[28px] p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">Connected Wallet</p>
                    <p className="font-black text-stone-800 text-sm">{shortAddr(wallet)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">Balance</p>
                    <p className="font-black text-brand-olive text-sm">{balance ?? '...'} cKES</p>
                  </div>
                </div>
              )}

              {/* Amount grid */}
              <div className="grid grid-cols-2 gap-4">
                {AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setSelected(amt)}
                    className={`py-5 sm:py-8 rounded-[20px] sm:rounded-[28px] font-black text-xl sm:text-2xl serif tracking-tighter transition-all border-2 sm:border-4 active:scale-95 ${
                      selected === amt
                        ? 'bg-brand-red text-white border-brand-red shadow-2xl scale-[1.02]'
                        : 'bg-white text-stone-800 border-stone-100 hover:border-brand-red/30 shadow-sm'
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-[0.3em] font-black mb-1 opacity-60">KES</span>
                    {amt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selected && wallet && setStep('confirm')}
                disabled={!selected || !wallet}
                className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all disabled:opacity-40 disabled:grayscale active:scale-95"
              >
                {!wallet ? 'Connect Wallet First' : !selected ? 'Pick an Amount' : `Drop KES ${selected} via cKES`}
              </button>

              <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">
                Powered by Celo · MiniPay · cKES
              </p>
            </motion.div>
          )}

          {/* ── CONFIRM ─────────────────────────────────────────────────── */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
              <div className="bg-white rounded-[40px] p-10 shadow-xl border-4 border-stone-100 space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Sending</p>
                  <p className="text-5xl sm:text-7xl font-black serif tracking-tighter text-stone-900"><span className="text-brand-red text-xl sm:text-2xl">cKES</span> {selected}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">≈ KES {selected} · 1 cKES = 1 KES</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-stone-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">From</span>
                    <span className="font-black text-stone-700">{wallet ? shortAddr(wallet) : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">To</span>
                    <span className="font-black text-brand-olive">{COMMUNITY_WALLET ? shortAddr(COMMUNITY_WALLET) : 'Community Pool'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Network</span>
                    <span className="font-black text-stone-700">Celo · {miniPay ? 'MiniPay' : 'Wallet'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={handleDonate} className="w-full bg-brand-red text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-brown transition-all active:scale-95">
                    Confirm & Send
                  </button>
                  <button onClick={() => setStep('pick')} className="w-full text-stone-400 py-4 font-black text-xs uppercase tracking-widest hover:text-brand-red transition-colors">
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SENDING ─────────────────────────────────────────────────── */}
          {step === 'sending' && (
            <motion.div key="sending" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-8">
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-t-8 border-brand-red border-r-8 border-r-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-brand-red fill-brand-red/30 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black serif tracking-tighter text-stone-900">Dropping…</h2>
                <p className="text-stone-500 serif italic text-lg">Sending {selected} cKES on Celo</p>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ─────────────────────────────────────────────────── */}
          {step === 'success' && result && (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-10">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-brand-olive/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-brand-olive" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black serif tracking-tighter text-stone-900">Asante Sana!</h2>
                <p className="text-stone-500 serif italic text-xl">KES {result.amount} dropped to the community pool.</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">The mesh grows stronger.</p>
              </div>

              <a
                href={celoExplorerTx(result.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-olive border border-brand-olive/30 rounded-full px-6 py-3 hover:bg-brand-olive/5 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on Celoscan
              </a>

              <button onClick={() => navigate('/smartphone/dashboard')} className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all">
                Back to Dashboard
              </button>
            </motion.div>
          )}

          {/* ── FAILED ──────────────────────────────────────────────────── */}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-10">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center">
                  <XCircle className="w-16 h-16 text-brand-red" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black serif tracking-tighter text-stone-900">Drop Failed</h2>
                <p className="text-stone-500 serif italic text-lg">{errorMsg}</p>
              </div>
              <button onClick={() => { setStep('pick'); setErrorMsg(''); }}
                className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
