/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Worker, AsanteDrop } from "../types";
import { Coins, Send, Receipt, Sparkles, Shield, User, ArrowUpRight, TrendingUp } from "lucide-react";
import { NeonCard } from "./CyberDeck";

interface PaymentsCenterProps {
  workers: Worker[];
  drops: AsanteDrop[];
  onAddDrop: (drop: AsanteDrop) => void;
}

export function PaymentsCenter({ workers, drops, onAddDrop }: PaymentsCenterProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [tipCelo, setTipCelo] = useState<string>("");
  const [tippingMessage, setTippingMessage] = useState<string>("");
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  // Chama (group credit pools) mock state
  const [chamaContributions, setChamaContributions] = useState<number>(315.40);
  const [contributeAmount, setContributeAmount] = useState<string>("");
  const [chamaSuccessMsg, setChamaSuccessMsg] = useState("");
  const [chamaErrorMsg, setChamaErrorMsg] = useState("");

  const handleTipper = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setPaymentSuccessMsg("");

    if (!selectedWorkerId) {
      setErrorMessage("Please choose a technician node to tip!");
      return;
    }
    const amount = parseFloat(tipCelo);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Specify valid CELO stablecoin token value!");
      return;
    }

    const workerObj = workers.find((w) => w.id === selectedWorkerId);
    if (!workerObj) return;

    // Simulate real on-chain transaction hash
    const generatedHash = "0x" + Array.from({ length: 40 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");

    const newDrop: AsanteDrop = {
      id: `drop-${Date.now()}`,
      workerId: selectedWorkerId,
      workerName: workerObj.name,
      amountCelo: amount,
      transactionHash: generatedHash.slice(0, 8) + "..." + generatedHash.slice(-6),
      reason: tippingMessage || "High quality service tip",
      timestamp: new Date().toISOString()
    };

    onAddDrop(newDrop);
    setTxHash(generatedHash);
    setPaymentSuccessMsg(`Success! Tipped ${amount} CELO ($${(amount * 1.05).toFixed(2)}) directly to ${workerObj.name}`);
    setTipCelo("");
    setTippingMessage("");

    // Clear after 7 seconds
    setTimeout(() => {
      setPaymentSuccessMsg("");
      setTxHash("");
    }, 7000);
  };

  const handleChamaContribute = (e: React.FormEvent) => {
    e.preventDefault();
    setChamaSuccessMsg("");
    setChamaErrorMsg("");

    const amount = parseFloat(contributeAmount);
    if (!isNaN(amount) && amount > 0) {
      setChamaContributions(chamaContributions + amount);
      setContributeAmount("");
      setChamaSuccessMsg(`Success! Pool updated: +${amount} CELO added to Cham Tooling Pool.`);
      setTimeout(() => setChamaSuccessMsg(""), 5000);
    } else {
      setChamaErrorMsg("Please specify a valid positive CELO contribution!");
    }
  };

  return (
    <div className="space-y-4">
      {/* Asante Header */}
      <NeonCard glowColor="mint" className="p-4 bg-zinc-900 border border-white/[0.08]">
        <header className="flex justify-between items-center mb-2 pb-2 border-b border-white/[0.06] select-none">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyber-mint animate-pulse" />
            <div>
              <h3 className="font-sans font-bold text-xs text-cyber-cream uppercase tracking-wider">MiniPay Asante Protocol</h3>
              <p className="text-[9px] text-zinc-500 font-mono leading-none">CELLULAR CELLO BLOCKCHAIN REWARDS</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-cyber-mint/10 border border-cyber-mint/30 rounded-full text-[9px] font-mono font-bold text-cyber-mint">CELO ACTIVE</span>
        </header>
        <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
          The **Asante Protocol** allows clients to tip reliable workers directly using MiniPay stablecoins, completely bypassing commercial bank commissions.
        </p>
      </NeonCard>

      {/* Tipping Board */}
      <NeonCard glowColor="gold" title="Tip a Verified Technician" subLabel="Direct Escrow">
        <form onSubmit={handleTipper} className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 block">CHOOSE TECHNICIAN NODE</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-cyber-cream focus:outline-hidden text-[11px] focus:border-cyber-gold/40"
            >
              <option value="" className="bg-zinc-950">-- Choose active fundi --</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id} className="bg-zinc-950">{w.name} ({w.category} • {w.locationName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-1">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 block">TIP COINS (CELO)</label>
              <div className="flex gap-1 items-center bg-zinc-950 border border-white/[0.08] rounded-xl px-2.5 py-1">
                <span className="text-zinc-500 text-[10px] select-none">C$</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 5.5"
                  value={tipCelo}
                  onChange={(e) => setTipCelo(e.target.value)}
                  className="w-full bg-transparent border-none text-cyber-cream outline-hidden font-bold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 block">MAPPED VALUATION</label>
              <div className="py-1.5 px-2 bg-zinc-950/50 rounded-xl text-zinc-400 italic font-mono select-none text-[10px] border border-white/[0.04]">
                ≈ {tipCelo ? (parseFloat(tipCelo) * 135).toFixed(0) : "0"} Ksh
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 block flex justify-between">
              <span>OPTIONAL ASANTE GRATITUDE MEMO</span>
              <span className="text-zinc-600">SMS Alert Included</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Excellent photovoltaic solder quality!"
              value={tippingMessage}
              onChange={(e) => setTippingMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-cyber-cream focus:outline-hidden font-sans focus:border-cyber-gold/40"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-cyber-red/10 border border-cyber-red/20 rounded-xl text-cyber-red text-[11px] font-sans">
              <span className="font-bold">⚠️ Warning:</span> {errorMessage}
            </div>
          )}

          {paymentSuccessMsg && (
            <div className="p-2.5 bg-cyber-mint/10 border border-cyber-mint/30 rounded-xl text-cyber-mint text-[11px] font-sans flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                <span className="font-bold">{paymentSuccessMsg}</span>
              </div>
              {txHash && (
                <div className="font-mono text-[9px] select-all bg-zinc-950 px-2 py-1 rounded text-cyber-mint border border-cyber-mint/15 leading-none flex justify-between items-center">
                  <span>TX: {txHash.slice(0, 18)}...{txHash.slice(-14)}</span>
                  <span className="text-[8px] bg-cyber-mint text-zinc-950 font-bold px-1 rounded">MINTED</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-cyber-gold text-zinc-950 font-sans font-bold rounded-xl text-[10px] select-none cursor-pointer transform hover:scale-[1.01] transition uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> SECURE BLOCKCHAIN TRANSMIT
          </button>
        </form>
      </NeonCard>

      {/* Cyber-Chama microcredit pooling */}
      <NeonCard glowColor="violet">
        <header className="flex justify-between items-baseline mb-2 border-b border-white/[0.06] pb-1.5">
          <div className="space-y-0.5 select-none">
            <h4 className="font-sans font-bold text-xs text-cyber-cream uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyber-gold" /> Cyber-Chama Pool-7
            </h4>
            <p className="text-[9px] text-zinc-500 font-mono uppercase">Cooperatives Tool Purchase Ledger</p>
          </div>
          <div className="max-w-max text-right select-none font-mono">
            <span className="text-[9px] text-zinc-500 block leading-none">TOTAL COLLATERAL</span>
            <span className="text-sm font-bold text-cyber-mint">{chamaContributions.toFixed(2)} CELO</span>
          </div>
        </header>

        <p className="font-sans text-[11px] text-zinc-400 leading-relaxed mb-3.5">
          Fundis in Githurai and Kibera form **Chama Collectives** to pool local micro-finance savings. This pool is earmarked to import digital trace-analyzers and hybrid solder kits.
        </p>

        <form onSubmit={handleChamaContribute} className="space-y-2">
          {chamaSuccessMsg && (
            <div className="p-2 py-1 bg-cyber-mint/10 border border-cyber-mint/20 rounded-lg text-cyber-mint text-[10px] font-sans">
              {chamaSuccessMsg}
            </div>
          )}
          {chamaErrorMsg && (
            <div className="p-2 py-1 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ef4444] text-[10px] font-sans">
              {chamaErrorMsg}
            </div>
          )}
          <div className="flex gap-2 font-mono text-xs">
            <div className="flex-1 flex gap-1 items-center bg-zinc-950 border border-white/[0.08] rounded-xl px-2.5">
              <span className="text-zinc-500 font-bold select-none text-[10px]">C$</span>
              <input
                type="text"
                placeholder="Contribute (e.g. 10)"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                className="w-full bg-transparent border-none text-cyber-cream outline-hidden p-1 text-[11px]"
              />
            </div>
            <button type="submit" className="px-4 bg-zinc-800 font-semibold text-cyber-cream rounded-xl hover:text-cyber-gold hover:bg-zinc-700 cursor-pointer border border-white/[0.08] text-[10px] transition uppercase tracking-wider">
              POOL FUNDS
            </button>
          </div>
        </form>
      </NeonCard>

      {/* Asante Drops list */}
      <div className="space-y-2.5 pt-1">
        <h4 className="font-mono text-[10px] font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
          <Receipt className="w-4 h-4" /> RECENT BLOCKCHAIN LEDGERS
        </h4>
        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {drops.map((drop) => (
            <div key={drop.id} className="p-3 bg-zinc-900 border border-white/[0.08] rounded-xl font-sans text-xs flex justify-between items-center gap-2">
              <div className="space-y-1 min-w-0">
                <p className="font-mono text-[10px] text-cyber-cream font-bold truncate">
                  <User className="w-3.5 h-3.5 inline mr-1 text-cyber-gold" /> {drop.workerName}
                </p>
                <p className="text-[11px] text-zinc-400 truncate font-sans text-left italic">"{drop.reason}"</p>
                <div className="font-mono text-[9px] text-zinc-500 select-all">TX: {drop.transactionHash}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-cyber-mint flex items-center gap-0.5 justify-end">
                  +{drop.amountCelo} C$ <ArrowUpRight className="w-3 h-3 text-cyber-mint" />
                </span>
                <span className="text-[8px] font-mono text-zinc-500 block uppercase leading-none">{new Date(drop.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
