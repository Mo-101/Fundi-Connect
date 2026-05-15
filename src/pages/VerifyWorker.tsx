import { useState, useRef } from "react";
import { 
  ShieldCheck, 
  Upload, 
  Camera, 
  FileText, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";

import { PageContainer, PageHeader } from '../components/standard/AppShell';

export default function VerifyWorker() {
  const [step, setStep] = useState<"intro" | "upload" | "submitted">("intro");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) return;
    setLoading(true);
    
    // Using api to save kyc request (assuming api handles it or we mock it)
    setTimeout(() => {
      setLoading(false);
      setStep("submitted");
    }, 1500);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Verify Status" 
        subtitle="Earn the shield and build trust."
      />

      <div className="max-w-xl mx-auto py-8">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Trust Shield", desc: "Appear higher in searches with a verified badge." },
                  { icon: <CheckCircle2 className="w-6 h-6" />, title: "Premium Jobs", desc: "Access high-budget jobs that require verified workers." },
                  { icon: <AlertCircle className="w-6 h-6" />, title: "Secure Network", desc: "Help keep FundiConnect safe for everyone." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] flex items-start gap-6 shadow-sm border border-stone-100 group hover:border-brand-indigo/10 transition-all">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-brand-indigo transition-all">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black serif tracking-tight">{item.title}</h3>
                      <p className="text-stone-400 serif italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep("upload")}
                className="w-full bg-brand-indigo text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-brown transition-all"
              >
                Start Verification
              </button>
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                {[
                  { id: 'idCard', icon: <FileText />, title: "National ID / Passport", desc: "Front & Back copies" },
                  { id: 'certificate', icon: <Upload />, title: "Technical Certificate", desc: "Skill certification (Optional)" },
                  { id: 'selfie', icon: <Camera />, title: "Verification Selfie", desc: "Clear photo of your face" }
                ].map((item) => (
                  <div key={item.id} className="bg-white p-8 rounded-[32px] border-4 border-dashed border-stone-100 hover:border-brand-indigo transition-colors group cursor-pointer text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto text-stone-300 group-hover:text-brand-indigo transition-all">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black serif tracking-tight">{item.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-brand-red text-white py-6 rounded-[24px] font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-brand-brown transition-all disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Submit Review"}
                </button>
                <button onClick={() => setStep("intro")} className="px-8 py-6 rounded-[24px] bg-stone-100 font-black text-[10px] uppercase tracking-widest text-stone-400">Cancel</button>
              </div>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div 
              key="submitted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-12"
            >
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-brand-indigo/10 rounded-[48px] flex items-center justify-center text-brand-indigo">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black serif tracking-tighter leading-none text-stone-900">Submitted!</h2>
                <p className="text-stone-500 serif italic text-xl">Our team will review your documents within 24 hours. You'll be notified of your status.</p>
              </div>
              <button 
                onClick={() => navigate('/smartphone/dashboard')}
                className="w-full bg-stone-900 text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-brand-red transition-all"
              >
                Return Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
