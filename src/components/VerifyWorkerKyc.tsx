/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  X,
  FileCheck
} from "lucide-react";
import { NeonCard, KenteStrip } from "./CyberDeck";

interface VerifyWorkerKycProps {
  onBack: () => void;
  onSubmitted: () => void;
}

export function VerifyWorkerKyc({ onBack, onSubmitted }: VerifyWorkerKycProps) {
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [loading, setLoading] = useState(false);

  // File mocks
  const [filesUploaded, setFilesUploaded] = useState({
    idUploaded: false,
    idName: "",
    certUploaded: false,
    certName: "",
    selfieUploaded: false,
    selfieName: ""
  });

  const handleUploadMock = (docType: "id" | "cert" | "selfie") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFilesUploaded(prev => {
        if (docType === "id") {
          return { ...prev, idUploaded: true, idName: "NATIONAL_ID_CARD_SCAN.JPG" };
        } else if (docType === "cert") {
          return { ...prev, certUploaded: true, certName: "NITA_ELECTRIC_CERTIFICATE.PDF" };
        } else {
          return { ...prev, selfieUploaded: true, selfieName: "SELFIE_CAMERA_CAPTURED.PNG" };
        }
      });
    }, 1500);
  };

  const clearDocMock = (docType: "id" | "cert" | "selfie") => {
    setFilesUploaded(prev => {
      if (docType === "id") {
        return { ...prev, idUploaded: false, idName: "" };
      } else if (docType === "cert") {
        return { ...prev, certUploaded: false, certName: "" };
      } else {
        return { ...prev, selfieUploaded: false, selfieName: "" };
      }
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("review");
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={onBack}
          className="p-2.5 bg-zinc-900 border border-white/[0.08] text-cyber-gold hover:text-white rounded-xl transition cursor-pointer font-bold text-xs flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> BACK
        </button>
        <span className="font-mono text-zinc-500 text-xs">// CELL IDENTITY VERIFICATION TIER //</span>
      </div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="kyc-upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Identity Verification Desk" subLabel="Vouch Requirements">
              <div className="space-y-6">
                <div className="space-y-2 select-none">
                  <span className="py-0.5 px-2 bg-cyber-gold/10 border border-cyber-gold/30 rounded-full text-[9px] font-mono font-bold text-cyber-gold uppercase tracking-widest inline-block select-all leading-none">
                    TIER-3 TRUST CRADLE FLAG
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    Submit Credentials to Vouch Group
                  </h3>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Access premium contract work and trigger high trust rankings on Nairobi search indexes by submitting standard verification records. Local cooperative trustees check scans manually.
                  </p>
                </div>

                {loading && (
                  <div className="p-4 bg-zinc-950 border border-cyber-gold/20 rounded-2xl flex items-center justify-center gap-3 select-none">
                    <div className="w-4 h-4 border-2 border-cyber-gold border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[10px] uppercase text-cyber-gold animate-pulse font-bold">Uploading credential metadata block...</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Document 1: National ID */}
                  <div className="p-5 bg-zinc-950 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-cyber-gold transition flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-zinc-900 rounded-xl text-zinc-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-black text-xs text-white uppercase select-none">National ID Card / Passport</h4>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">FRONT & BACK COPIES (MAX 8MB)</p>
                        {filesUploaded.idUploaded && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-cyber-mint/10 border border-cyber-mint/35 text-cyber-mint text-[9px] font-mono rounded font-bold uppercase select-none mt-1">
                            <CheckCircle className="w-3 h-3" /> {filesUploaded.idName}
                          </div>
                        )}
                      </div>
                    </div>
                    {filesUploaded.idUploaded ? (
                      <button 
                        onClick={() => clearDocMock("id")}
                        className="p-1 px-2.5 bg-cyber-red/10 border border-cyber-red/35 hover:bg-cyber-red hover:text-white rounded-lg text-cyber-red text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Clear
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUploadMock("id")}
                        className="p-1.5 px-3 bg-zinc-900 border border-white/[0.06] hover:border-cyber-gold text-cyber-gold rounded-xl text-[10.5px] font-mono uppercase cursor-pointer"
                      >
                        UPLOAD SCAN
                      </button>
                    )}
                  </div>

                  {/* Document 2: Technical Certificate */}
                  <div className="p-5 bg-zinc-950 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-cyber-gold transition flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-zinc-900 rounded-xl text-zinc-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-black text-xs text-white uppercase select-none">Technical Trade Certificate</h4>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">NITA / TECHNICAL SCHOOL DEVISE PORT (OPTIONAL)</p>
                        {filesUploaded.certUploaded && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-cyber-mint/10 border border-cyber-mint/35 text-cyber-mint text-[9px] font-mono rounded font-bold uppercase select-none mt-1">
                            <CheckCircle className="w-3 h-3" /> {filesUploaded.certName}
                          </div>
                        )}
                      </div>
                    </div>
                    {filesUploaded.certUploaded ? (
                      <button 
                        onClick={() => clearDocMock("cert")}
                        className="p-1 px-2.5 bg-cyber-red/10 border border-cyber-red/35 hover:bg-cyber-red hover:text-white rounded-lg text-cyber-red text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Clear
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUploadMock("cert")}
                        className="p-1.5 px-3 bg-zinc-900 border border-white/[0.06] hover:border-cyber-gold text-cyber-gold rounded-xl text-[10.5px] font-mono uppercase cursor-pointer"
                      >
                        UPLOAD FILE
                      </button>
                    )}
                  </div>

                  {/* Document 3: Selfie Verification */}
                  <div className="p-5 bg-zinc-950 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-cyber-gold transition flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-zinc-900 rounded-xl text-zinc-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-black text-xs text-white uppercase select-none">ID-Holding Selfie Capture</h4>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">CLEAR SHOT HOLDING NATIONAL IDENTITY CARD</p>
                        {filesUploaded.selfieUploaded && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-cyber-mint/10 border border-cyber-mint/35 text-cyber-mint text-[9px] font-mono rounded font-bold uppercase select-none mt-1">
                            <CheckCircle className="w-3 h-3" /> {filesUploaded.selfieName}
                          </div>
                        )}
                      </div>
                    </div>
                    {filesUploaded.selfieUploaded ? (
                      <button 
                        onClick={() => clearDocMock("selfie")}
                        className="p-1 px-2.5 bg-cyber-red/10 border border-cyber-red/35 hover:bg-cyber-red hover:text-white rounded-lg text-cyber-red text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Clear
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUploadMock("selfie")}
                        className="p-1.5 px-3 bg-zinc-900 border border-white/[0.06] hover:border-cyber-gold text-cyber-gold rounded-xl text-[10.5px] font-mono uppercase cursor-pointer"
                      >
                        OPEN WEB-PORTAL CAMERA
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={!filesUploaded.idUploaded || !filesUploaded.selfieUploaded || loading}
                    onClick={handleSubmit}
                    className="w-full py-3 bg-cyber-gold disabled:opacity-40 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] transition-transform shadow-lg shadow-cyber-gold/5"
                  >
                    SUBMIT VERIFICATION DOSSIER
                  </button>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="kyc-review"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <NeonCard glowColor="mint" title="Status: Under Evaluation">
              <div className="space-y-6 flex flex-col items-center">
                <div className="h-16 w-16 bg-cyber-mint/10 border border-cyber-mint/30 rounded-3xl flex items-center justify-center text-cyber-mint animate-pulse select-none">
                  <FileCheck className="w-8 h-8" />
                </div>
                
                <div className="space-y-2 select-all">
                  <h3 className="font-sans font-black text-2xl text-cyber-cream uppercase tracking-tight">
                    PACKETS SUBMITTED FOR REVIEW
                  </h3>
                  <p className="font-sans text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Your identity and technical certificates have been indexed on our secure ledger queue. Our localized cooperative trustees will review scans and verify your credentials within 24 hours.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl w-full border border-white/[0.03] text-left select-none max-w-sm">
                  <div className="flex justify-between items-baseline border-b border-white/[0.03] pb-2 text-[10px] font-mono uppercase text-zinc-500 font-bold">
                    <span>Audit Pipeline Log</span>
                    <span className="text-cyber-gold animate-pulse">QUEUED</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-xs text-zinc-400 font-mono">
                    <p>✔ Scan National ID packet linked</p>
                    <p>✔ Facial biometric holding verification</p>
                    <p className="text-zinc-600">⌛ Cooperatives evaluation checklist status...</p>
                  </div>
                </div>

                <div className="pt-2 w-full">
                  <button
                    onClick={onSubmitted}
                    className="px-6 py-3 bg-[#fafafa] hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer w-full max-w-sm"
                  >
                    RETURN TO DASHBOARD
                  </button>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
