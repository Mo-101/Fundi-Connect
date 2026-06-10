/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Cpu, Wifi, Battery, Command, Smartphone, Globe, Coins, ShieldCheck, HelpCircle } from "lucide-react";

// 1. Kente Strip Component: Animated tribal cyberpunk gradient strip divider
export function KenteStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-2.5 w-full overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 animate-kente-strip bg-repeat-x"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, 
            #FFB400 0px, #FFB400 10px, 
            #E63946 10px, #E63946 20px, 
            #06D6A0 20px, #06D6A0 30px, 
            #11163A 30px, #11163A 40px
          )`,
          backgroundSize: "80px 100%"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0A0E27]/40 to-transparent" />
    </div>
  );
}

// 2. Woven Grid Overlay background
export function WovenGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-color-dodge">
      <div className="absolute inset-0 woven-grid" />
      {/* Glow hubs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyber-gold/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyber-mint/10 rounded-full blur-[100px]" />
      <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-cyber-red/10 rounded-full blur-[60px]" />
    </div>
  );
}

// 3. Cyberpunk-themed Card with Neon Corner brackets
export function NeonCard({
  children,
  className = "",
  glowColor = "gold",
  title,
  subLabel,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "mint" | "red" | "violet";
  title?: string;
  subLabel?: string;
  onClick?: () => void;
  key?: string | number;
}) {
  const borderStyles = {
    gold: "border-white/[0.08] hover:border-cyber-gold shadow-xs hover:shadow-neon-gold/5",
    mint: "border-white/[0.08] hover:border-cyber-mint shadow-xs hover:shadow-neon-mint/5",
    red: "border-white/[0.08] hover:border-cyber-red shadow-xs hover:shadow-neon-red/5",
    violet: "border-white/[0.08] hover:border-cyber-violet/70 shadow-none",
  };

  const textStyles = {
    gold: "text-cyber-gold",
    mint: "text-cyber-mint",
    red: "text-cyber-red",
    violet: "text-cyber-violet",
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-6 bg-[#18181b]/95 backdrop-blur-md border rounded-[1.5rem] transition-all duration-300 ${onClick ? 'cursor-pointer transform hover:scale-[1.01]' : ''} ${borderStyles[glowColor]} ${className}`}
    >
      {/* Corner Brackets hidden for clean Bento aesthetic */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cream/20 rounded-tl-sm pointer-events-none hidden" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cream/20 rounded-tr-sm pointer-events-none hidden" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cream/20 rounded-bl-sm pointer-events-none hidden" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cream/20 rounded-br-sm pointer-events-none hidden" />

      {/* Decorative Cyber Grid Dot */}
      <div className="absolute top-3 right-4 flex items-center gap-1 opacity-20 pointer-events-none">
        <span className="w-1 h-1 rounded-full bg-cyber-cream"></span>
        <span className="w-1 h-1 rounded-full bg-cyber-cream"></span>
      </div>

      {(title || subLabel) && (
        <div className="mb-4 border-b border-white/[0.06] pb-3 flex justify-between items-baseline">
          {title && (
            <h4 className="font-sans font-semibold text-cyber-cream tracking-tight text-base flex items-center gap-1.5ClassName">
              {title}
            </h4>
          )}
          {subLabel && (
            <span className={`font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider font-semibold ${
              glowColor === 'gold' 
                ? 'bg-cyber-gold text-zinc-950' 
                : glowColor === 'mint'
                ? 'bg-cyber-mint/15 text-cyber-mint'
                : glowColor === 'red'
                ? 'bg-cyber-red/15 text-cyber-red'
                : 'bg-cyber-surface-light text-cyber-cream'
            }`}>
              {subLabel}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

// 4. USSD Code Simulator Dialing Window
export function UssdSimulator({
  isOpen,
  onClose,
  onJobCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: (newJob: any) => void;
}) {
  const [ussdStep, setUssdStep] = useState<"dial" | "menu" | "post-category" | "post-desc" | "post-budget" | "post-location" | "find-menu" | "list-workers" | "success" | "sms-alert">("dial");
  const [dialCode, setDialCode] = useState("*384#");
  const [menuInput, setMenuInput] = useState("");
  const [validationError, setValidationError] = useState("");
  
  // USSD Draft state
  const [jobCategory, setJobCategory] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [jobLocation, setJobLocation] = useState("");

  const handleDial = () => {
    if (dialCode === "*384#") {
      setUssdStep("menu");
      setValidationError("");
    } else {
      setValidationError("Invalid M-Fundi Code. Try tapping *384#");
    }
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = menuInput.trim();
    setMenuInput("");

    if (ussdStep === "menu") {
      if (input === "1") {
        setUssdStep("post-category");
      } else if (input === "2") {
        setUssdStep("find-menu");
      } else {
        setValidationError("Select [1] or [2]");
      }
    } else if (ussdStep === "post-category") {
      if (["1", "2", "3", "4"].includes(input)) {
        const cats = { "1": "Electrical", "2": "Plumbing", "3": "Smart Tech", "4": "Masonry" };
        setJobCategory(cats[input as keyof typeof cats]);
        setUssdStep("post-desc");
        setValidationError("");
      } else {
        setValidationError("Select 1, 2, 3, or 4");
      }
    } else if (ussdStep === "post-desc") {
      if (input.length > 5) {
        setJobDesc(input);
        setUssdStep("post-budget");
        setValidationError("");
      } else {
        setValidationError("Enter a descriptive issue (min 5 letters)");
      }
    } else if (ussdStep === "post-budget") {
      const parsed = parseInt(input);
      if (!isNaN(parsed) && parsed > 100) {
        setJobBudget(input);
        setUssdStep("post-location");
        setValidationError("");
      } else {
        setValidationError("Enter standard Ksh budget (digit > 100)");
      }
    } else if (ussdStep === "post-location") {
      if (input.length >= 3) {
        setJobLocation(input);
        // Execute dynamic job creation back into local app
        if (onJobCreated) {
          onJobCreated({
            id: `job-ussd-${Date.now()}`,
            title: `${jobCategory} Service Request`,
            description: `${jobDesc} (via USSD)`,
            category: jobCategory,
            budgetKsh: parseInt(jobBudget) || 1200,
            locationName: input,
            coordinates: { lat: -1.312 + Math.random() * 0.02, lng: 36.78 + Math.random() * 0.02 },
            postedDate: new Date().toISOString(),
            status: "open",
            urgency: "immediate",
            clientId: "cl-ussd",
            clientName: "USSD Client",
            clientPhone: "+254 799 " + Math.floor(100000 + Math.random() * 900000),
            paymentStatus: "unpaid"
          });
        }
        setUssdStep("success");
      } else {
        setValidationError("Please specify detailed sub-location");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-midnight/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden bg-cyber-surface border-2 border-cyber-gold/80 rounded-lg shadow-2xl">
        {/* USSD Screen Ribbon */}
        <div className="flex justify-between items-center bg-[#182052] px-4 py-2 border-b border-cyber-gold/20 font-mono text-xs">
          <span className="text-cyber-gold flex items-center gap-1.5 font-medium">
            <Command className="w-3.5 h-3.5" /> DIALER SIMULATOR EAT
          </span>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-cream cursor-pointer text-sm">✕</button>
        </div>

        {/* Console view */}
        <div className="p-6 font-mono text-sm bg-cyber-surface-dark min-h-[300px] flex flex-col justify-between">
          <div>
            <div className="text-center text-cyber-muted/65 text-xs mb-3 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Feature Phone Network Simulator
            </div>

            {ussdStep === "dial" && (
              <div className="space-y-4 pt-4">
                <p className="text-cyber-cream/80 text-center leading-relaxed">
                  Millions in East Africa use USSD protocols to access microservices on non-smart devices. Dial the M-Fundi portal block below:
                </p>
                <div className="flex gap-2 p-2 bg-cyber-surface rounded border border-cyber-cream/10 items-center justify-between">
                  <span className="text-cyber-gold font-bold select-none text-base pl-2">⚡</span>
                  <input
                    type="text"
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="flex-1 bg-transparent border-none text-cyber-cream font-bold outline-hidden text-center text-lg tracking-widest px-2"
                  />
                </div>
                {validationError && <p className="text-cyber-red text-center text-xs">{validationError}</p>}
                
                <button
                  onClick={handleDial}
                  className="w-full py-2.5 bg-cyber-gold font-display font-medium text-cyber-midnight rounded hover:bg-cyber-gold/90 border-b-2 border-orange-600 transition"
                >
                  SEND PROTOCOL LINK
                </button>
              </div>
            )}

            {ussdStep !== "dial" && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#0A0E27]/90 border border-cyber-gold/20 rounded">
                  <header className="text-center pb-2 border-b border-cyber-cream/10 text-xs text-cyber-gold font-bold">
                    --- FUNDI-CONNECT USSD PORT ---
                  </header>

                  {ussdStep === "menu" && (
                    <div className="space-y-1.5 py-2 text-cyber-cream/90 text-xs">
                      <p>Welcome to Boma Fundi Service Hub:</p>
                      <p>1. Post Pipe/Solar/Grid Work</p>
                      <p>2. Discover Near Handymen</p>
                      <p className="text-cyber-muted italic mt-2">Enter choice standard format:</p>
                    </div>
                  )}

                  {ussdStep === "post-category" && (
                    <div className="space-y-1 py-1 text-cyber-cream/90 text-xs">
                      <p>Select Trade/Skills requested:</p>
                      <p>1. Electrical / Grid Solar</p>
                      <p>2. Plumbing / Wastewater</p>
                      <p>3. Smart Tech / Cyberboards</p>
                      <p>4. Masonry / Concrete Foundation</p>
                    </div>
                  )}

                  {ussdStep === "post-desc" && (
                    <div className="space-y-1 py-1 text-cyber-cream/90 text-xs">
                      <p>Job Description:</p>
                      <p className="text-cyber-mint/90 italic">Describe brief issues in standard SMS (e.g. "fuse shorted on pump" or "leak near kitchen block"):</p>
                    </div>
                  )}

                  {ussdStep === "post-budget" && (
                    <div className="space-y-1 py-1 text-cyber-cream/90 text-xs">
                      <p>Project Budget (Ksh):</p>
                      <p className="text-cyber-gold/90 italic">Enter Ksh budget limit directly (e.g. 1500, 3500, 8000):</p>
                    </div>
                  )}

                  {ussdStep === "post-location" && (
                    <div className="space-y-1 py-1 text-cyber-cream/90 text-xs">
                      <p>Specific Township/Sector:</p>
                      <p className="text-cyber-cream/70">Examples: Kangemi Sector 2, Kibera Compound B, Githurai Market.</p>
                      <p className="text-cyber-mint/95 italic">Enter township name:</p>
                    </div>
                  )}

                  {ussdStep === "success" && (
                    <div className="space-y-2 py-1 text-cyber-cream/95 text-xs text-center">
                      <span className="text-2xl text-cyber-mint">✔</span>
                      <p className="text-cyber-mint font-bold uppercase">Transaction Completed</p>
                      <p className="text-left text-[11px] text-cyber-cream/75">Your job is loaded in the smart pipeline. Local workers with basic SMS/USSD will receive matching SMS notifications immediately. Match results loaded onto core system!</p>
                    </div>
                  )}
                </div>

                {ussdStep !== "success" && (
                  <form onSubmit={handleMenuSubmit} className="space-y-2">
                    <div className="flex gap-1 border border-cyber-cream/10 rounded overflow-hidden">
                      <input
                        type="text"
                        placeholder="Type choice and send..."
                        autoFocus
                        value={menuInput}
                        onChange={(e) => setMenuInput(e.target.value)}
                        className="flex-1 bg-cyber-surface px-2.5 py-2 text-xs text-cyber-cream outline-hidden"
                      />
                      <button type="submit" className="px-3 bg-cyber-gold text-cyber-midnight text-xs font-bold cursor-pointer hover:bg-cyber-gold/90">
                        SEND
                      </button>
                    </div>
                    {validationError && <p className="text-cyber-red text-[11px] font-bold">{validationError}</p>}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="border-t border-cyber-cream/10 pt-3 flex gap-2 justify-between">
            {ussdStep !== "dial" && (
              <button
                onClick={() => {
                  setUssdStep("dial");
                  setValidationError("");
                  setJobCategory("");
                  setJobDesc("");
                  setJobBudget("");
                  setJobLocation("");
                }}
                className="text-xs text-cyber-muted hover:text-cyber-gold font-bold flex items-center gap-1 transition"
              >
                ← BACK DIAL
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-cyber-red ml-auto font-bold opacity-80 hover:opacity-100 uppercase"
            >
              DISCONNECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
