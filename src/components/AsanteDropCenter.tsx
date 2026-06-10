/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Wallet, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  RefreshCw,
  Coins,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { NeonCard } from "./CyberDeck";

interface AsanteDropCenterProps {
  onSuccess: (amount: number, txHash: string) => void;
  onClose: () => void;
  targetWorkerName?: string;
  workerWalletAddress?: string;
}

const AMOUNTS = [10, 20, 50, 100];

export function AsanteDropCenter({
  onSuccess,
  onClose,
  targetWorkerName = "the Platform Support Fund",
  workerWalletAddress
}: AsanteDropCenterProps) {
  const [step, setStep] = useState<"pick" | "sending" | "success" | "failed">("pick");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  const customTxHash = `0x${Array.from({ length: 40 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`;

  useEffect(() => {
    // Check if wallet is already stored
    const existing = localStorage.getItem("celo_wallet");
    if (existing) {
      setWalletAddress(existing);
      setWalletConnected(true);
      setBalance("145.50"); // initial sample cKES
    }
  }, []);

  const handleConnectWallet = () => {
    const dummyAddr = `0x${Array.from({ length: 35 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`;
    localStorage.setItem("celo_wallet", dummyAddr);
    setWalletAddress(dummyAddr);
    setWalletConnected(true);
    setBalance("182.00"); // mock top-up standard
  };

  const handleSendTip = () => {
    if (!selectedAmount) return;
    
    // Check balance
    const currentBal = parseFloat(balance);
    if (currentBal < selectedAmount) {
      setErrorMsg("Insufficient cKES balance in MiniPay wallet. Please top up.");
      setStep("failed");
      return;
    }

    setStep("sending");
    setTimeout(() => {
      // update mock balances on success
      const newBal = (currentBal - selectedAmount).toFixed(2);
      setBalance(newBal);
      onSuccess(selectedAmount, customTxHash);
      setStep("success");
    }, 3000);
  };

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-midnight/90 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden bg-cyber-surface border-2 border-cyber-red/80 rounded-2xl shadow-2xl">
        
        {/* Title Belt */}
        <div className="flex justify-between items-center bg-[#182052] px-4 py-2 border-b border-cyber-red/20 font-mono text-xs select-none">
          <span className="text-cyber-red flex items-center gap-1.5 font-bold animate-pulse">
            <Heart className="w-3.5 h-3.5 fill-cyber-red" /> MINIPAY ASANTE TIP PROTOCOL
          </span>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-cream cursor-pointer text-sm">✕</button>
        </div>

        {/* Content Console */}
        <div className="p-6 font-mono text-sm bg-cyber-surface-dark min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === "pick" && (
              <motion.div
                key="step-pick"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Intro statement banner */}
                <div className="p-4 bg-cyber-red/5 border border-cyber-red/25 rounded-xl text-center space-y-1.5 select-all">
                  <h4 className="font-sans font-black text-xs text-[#fafafa] uppercase">
                    VOUCH SUPPORT FOR {targetWorkerName && targetWorkerName.toUpperCase()}
                  </h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Direct handoff tipping. 100% of transactions go directly into the peer recipient on-chain address or platform support index with zero middle-bank deductions.
                  </p>
                </div>

                {/* Wallet block */}
                {!walletConnected ? (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full py-3 bg-cyber-red hover:bg-cyber-red/90 text-white rounded-xl shadow-lg border border-red-650 font-sans font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" /> LINK MINIPAY CELO WALLET
                  </button>
                ) : (
                  <div className="p-3.5 bg-zinc-950 border border-white/[0.04] rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[8px] text-zinc-500 block uppercase">SECURE CELO ADDR</span>
                      <span className="font-bold text-cyber-cream">{shortAddr(walletAddress)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-zinc-500 block uppercase">MINIPAY BAL</span>
                      <span className="font-bold text-cyber-mint">{balance} cKES</span>
                    </div>
                  </div>
                )}

                {/* Amount selection block */}
                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block leading-none select-none">
                    Select Tipping Amount (cKES equivalent to KES)
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {AMOUNTS.map((amt) => {
                      const isSel = selectedAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSelectedAmount(amt)}
                          className={`py-3.5 rounded-xl border font-sans font-black text-sm select-none transition cursor-pointer ${
                            isSel 
                              ? "bg-cyber-red border-cyber-red text-white scale-102 shadow-lg shadow-cyber-red/10" 
                              : "bg-zinc-950 border-white/[0.06] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <span className="block text-[8px] text-zinc-500 uppercase font-mono">cKES</span>
                          {amt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button block */}
                <button
                  type="button"
                  onClick={handleSendTip}
                  disabled={!walletConnected || !selectedAmount}
                  className="w-full py-3.5 bg-[#fafafa] disabled:bg-zinc-900 disabled:opacity-40 hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {!walletConnected 
                    ? "Connect wallet first" 
                    : !selectedAmount 
                    ? "Pick tipping commitment" 
                    : `Disburse cKES ${selectedAmount} immediately`}
                </button>
              </motion.div>
            )}

            {step === "sending" && (
              <motion.div
                key="step-sending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="relative h-14 w-14 mx-auto select-none rounded-full flex items-center justify-center border-4 border-cyber-red/20 border-t-cyber-red animate-spin" />
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-base text-white uppercase tracking-tight">TRANSMITTING PACKETS</h4>
                  <p className="text-xs text-zinc-400 font-sans leading-normal">
                    Mining standard transaction block on Celo network. Broad-casting node balance changes to ledger sync...
                  </p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-5"
              >
                <div className="h-12 w-12 bg-cyber-mint/15 text-cyber-mint border border-cyber-mint/30 rounded-2xl flex items-center justify-center mx-auto select-none">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-sans font-black text-lg text-white uppercase select-none tracking-tight">ASANTE SANA // GIG CONFIRMED</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-xs mx-auto">
                    Your direct tipping of <strong>cKES {selectedAmount}</strong> has successfully released to the verified peer technician wallet.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl text-left select-all text-[10px] space-y-1">
                  <p className="font-semibold text-cyber-mint uppercase">Celo Network Transaction Log</p>
                  <p className="text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap">HASH: {customTxHash}</p>
                </div>

                <div className="flex gap-2 justify-center select-none pt-2">
                  <a 
                    href={`https://celoscan.io/tx/${customTxHash}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-white/[0.05] rounded-lg text-zinc-400 hover:text-white text-[9.5px] uppercase flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3 h-3" /> CELOSCAN
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 bg-cyber-red text-white hover:bg-cyber-red/90 rounded-lg text-[9.5px] font-sans font-bold uppercase cursor-pointer"
                  >
                    CLOSE PROMPT
                  </button>
                </div>
              </motion.div>
            )}

            {step === "failed" && (
              <motion.div
                key="step-failed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-4"
              >
                <div className="h-12 w-12 bg-cyber-red/15 text-cyber-red border border-cyber-red/30 rounded-2xl flex items-center justify-center mx-auto select-none">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-sans font-black text-[#fafafa] uppercase select-none tracking-tight">TRANSMITTAL CANCELED OR FAILED</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {errorMsg || "An unexpected error occurred while resolving network gas values. Try again."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setStep("pick");
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/[0.06] rounded-xl text-cyber-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-cyber-gold" /> TRY AGENT ESCROW CONCISELI
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[8px] text-zinc-550 text-zinc-500 uppercase tracking-widest leading-none pt-4 select-none">
            BLOCKCHAIN VALUE TRANSFER VIA CELO-MINIPAY ENGINE
          </p>
        </div>

      </div>
    </div>
  );
}
