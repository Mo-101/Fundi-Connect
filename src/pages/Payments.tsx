import { useState, useEffect, useRef } from "react";
import { Smartphone, ShieldCheck, ArrowRight, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { PageContainer, PageHeader } from '../components/standard/AppShell';

type Step = "input" | "processing" | "success" | "failed";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000; // 90 s — STK prompt expires on phone

export default function Payments() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState(searchParams.get("amount") || "100");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Enter your M-Pesa PIN on the popup to complete payment.");
  const navigate = useNavigate();

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type") || "general";

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollRef.current = null;
    timeoutRef.current = null;
  };

  useEffect(() => () => stopPolling(), []);

  const startPolling = (checkoutRequestId: string, mode: string) => {
    // Simulation mode resolves instantly
    if (mode === "simulation") {
      setStep("success");
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const result = await api.checkPaymentStatus(checkoutRequestId);
        if (result.status === "completed") {
          stopPolling();
          setReceipt(result.mpesaReceipt || checkoutRequestId);
          setStep("success");
        } else if (result.status === "failed") {
          stopPolling();
          setStep("failed");
        }
        // "pending" or "unknown" — keep polling
      } catch {
        // Network error — keep polling
      }
    }, POLL_INTERVAL_MS);

    // Hard timeout — stop after 90 s
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStatusMsg("Request timed out. If you already entered your PIN, your payment is being processed.");
      setStep("failed");
    }, POLL_TIMEOUT_MS);
  };

  const handlePayment = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId || !phone) return;

    setStep("processing");
    setStatusMsg("Enter your M-Pesa PIN on the popup to complete payment.");

    try {
      const resp = await api.initiateSTKPush({
        phone,
        amount: Number(amount),
        jobId: jobId || undefined,
        type,
        userId,
      });

      if (resp.ResponseCode !== "0") {
        setStep("failed");
        return;
      }

      setStatusMsg(resp.CustomerMessage || "Enter your M-Pesa PIN on the popup to complete payment.");
      startPolling(resp.checkoutRequestId, resp.mode);
    } catch {
      setStep("failed");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Check-Out."
        subtitle="Securely settle your mesh commitments."
      />

      <div className="max-w-xl mx-auto py-8">
        <AnimatePresence mode="wait">

          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="bg-white rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl space-y-6 sm:space-y-10 border-2 sm:border-4 border-stone-100">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">Amount to Pay (KES)</label>
                  <div className="text-4xl sm:text-6xl font-black serif tracking-tighter text-stone-900 leading-none">
                    <span className="text-brand-red">KES</span> {amount}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">M-Pesa Phone Number</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-red w-6 h-6" />
                    <input
                      type="tel"
                      placeholder="0712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-brand-cream p-5 pl-14 sm:p-8 sm:pl-20 rounded-[24px] sm:rounded-[32px] border-2 sm:border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-xl sm:text-2xl serif tracking-tight transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 pl-4">Safaricom number registered on M-Pesa</p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!phone}
                  className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  Send STK Push Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-brand-olive" />
                  Safaricom Daraja Secured
                </div>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center py-12 space-y-8"
            >
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-8 border-brand-red border-r-8 border-r-transparent"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-stone-900 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black serif tracking-tighter leading-none text-stone-900">Pushing STK...</h2>
                <p className="text-stone-500 serif italic text-xl">{statusMsg}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Waiting for confirmation from Safaricom</p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-12"
            >
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-brand-olive/10 rounded-full flex items-center justify-center text-brand-olive">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black serif tracking-tighter leading-none text-stone-900">Ulipia Vyema!</h2>
                <p className="text-stone-500 serif italic text-xl">Payment confirmed. Your Mesh record has been updated.</p>
                {receipt && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-brand-olive bg-brand-olive/10 rounded-full px-6 py-2 inline-block">
                    Receipt: {receipt}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate('/smartphone/dashboard')}
                className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}

          {step === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-12"
            >
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center text-brand-red">
                  <XCircle className="w-16 h-16" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black serif tracking-tighter leading-none text-stone-900">Payment Cancelled</h2>
                <p className="text-stone-500 serif italic text-xl">{statusMsg !== "Enter your M-Pesa PIN on the popup to complete payment." ? statusMsg : "You cancelled the M-Pesa prompt or it timed out."}</p>
              </div>
              <button
                onClick={() => { setStep("input"); setStatusMsg("Enter your M-Pesa PIN on the popup to complete payment."); }}
                className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all flex items-center justify-center gap-4"
              >
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
