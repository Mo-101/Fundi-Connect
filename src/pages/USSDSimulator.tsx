import { useState } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Sparkles, Smartphone, Hash, Phone, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type USSDScreen = {
  text: string;
  onInput?: (input: string) => void;
};

export default function USSDSimulator() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('main');
  const [input, setInput] = useState('');

  const screens: Record<string, USSDScreen> = {
    main: {
      text: "FundiConnect Africa\n1. I have a skill\n2. I need a worker\n3. Trust score check\n4. Registration breakdown\n5. Community Introducer (PIN req)\n6. Help",
      onInput: (val) => {
        if (val === '1') setCurrentScreen('worker_skill');
        if (val === '2') setCurrentScreen('client_req');
        if (val === '3') setCurrentScreen('trust_check');
        if (val === '4') setCurrentScreen('breakdown');
        if (val === '5') setCurrentScreen('introducer_pin');
      }
    },
    breakdown: {
      text: "KES 100 Breakdown:\nUSSD Credits: 40\nCard Print: 30\nSkillMesh Ledger: 20\nBaraza Fund: 10\nTotal: KES 100\n0. Back",
      onInput: (val) => {
        if (val === '0') setCurrentScreen('main');
      }
    },
    introducer_pin: {
      text: "Enter Introducer PIN\n(Elder/Pastor/Leader):",
      onInput: () => setCurrentScreen('vouch_phone')
    },
    vouch_phone: {
      text: "Enter Fundi Phone Num\nto Vouch:",
      onInput: () => setCurrentScreen('vouch_confirm')
    },
    vouch_confirm: {
      text: "Vouching for:\nMusa Otieno (Carpenter)\n1. Confirm Vouch\n0. Cancel",
      onInput: (val) => {
        if (val === '1') setCurrentScreen('vouch_done');
        else setCurrentScreen('main');
      }
    },
    vouch_done: {
      text: "Identity Witnessed!\n\nMusa Otieno is now Level 1 & visible to neighbors. Thank you for your leadership.\n0. Home",
      onInput: () => setCurrentScreen('main')
    },
    worker_skill: {
      text: "Select your skill:\n1. Carpenter\n2. Plumber\n3. Electrician\n4. Painter\n5. Mechanic\n6. Cleaner\n0. Back",
      onInput: (val) => {
        if (val === '0') setCurrentScreen('main');
        else setCurrentScreen('worker_location');
      }
    },
    worker_location: {
      text: "Enter your location:\n(e.g., Ruiru, Pipeline, Juja)",
      onInput: () => setCurrentScreen('worker_done')
    },
    worker_done: {
      text: "Registration received!\n\nWe will SMS you when a work request matches your skill in your neighborhood.\n0. Home",
      onInput: () => setCurrentScreen('main')
    },
    client_req: {
      text: "What fundi do you need?\n1. Plumbing\n2. Electrical\n3. Carpentry\n4. Cleaning\n5. Others",
      onInput: () => setCurrentScreen('client_location')
    },
    client_location: {
      text: "Where are you located?\n(Enter neighborhood)",
      onInput: () => setCurrentScreen('client_done')
    },
    client_done: {
      text: "Request broadcasted!\n\nWe are looking for verified fundis near you. You will receive an SMS soon.\n0. Home",
      onInput: () => setCurrentScreen('main')
    },
    trust_check: {
      text: "Enter Phone Number\nto check trust score:",
      onInput: () => setCurrentScreen('trust_result')
    },
    trust_result: {
      text: "Fundi: Musa Otieno\nSkill: Carpenter\nTrust Score: 94%\nVouches: 9\n\n0. Back",
      onInput: (val) => {
        if (val === '0') setCurrentScreen('main');
      }
    }
  };

  const current = screens[currentScreen];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const handler = current.onInput;
    if (handler) {
      handler(input);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-stone-900 selection:bg-brand-red/20 relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        <header className="mb-16 flex justify-between items-center">
          <button 
            onClick={() => navigate('/offline')} 
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-stone-400 hover:text-brand-red transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Nyuma (Back)
          </button>
          <div className="flex items-center gap-3 px-5 py-2 bg-brand-indigo text-brand-gold rounded-full shadow-xl text-[10px] font-black uppercase tracking-[0.3em]">
             USSD Protocol <Hash className="w-3.5 h-3.5" />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-brand-gold/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-brown shadow-sm border border-brand-gold/20">
              <Sparkles className="w-4 h-4" /> No data needed
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter serif leading-[0.9]">
              Connecting the next<br/><span className="text-brand-red">billion artisans.</span>
            </h1>
            <p className="text-2xl text-brand-indigo font-black serif italic opacity-80 leading-none">Unganisha bila mtandao.</p>
            <p className="text-xl text-stone-500 serif italic leading-relaxed max-w-md">
              The USSD channel allows workers on basic phones to register, check their honor score, and receive job alerts via SMS. Try the Frequency Simulator.
            </p>
            
            <div className="space-y-6 pt-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-[24px] shadow-xl text-brand-red border border-stone-100">
                  <Wifi className="w-6 h-6 opacity-30" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Accessibility</p>
                  <p className="text-lg font-black text-stone-900 serif italic">Zero data usage for the Fundi</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white rounded-[24px] shadow-xl text-brand-indigo border border-stone-100">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Hardware</p>
                  <p className="text-lg font-black text-stone-900 serif italic">Works on any basic GSM phone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Phone Simulator */}
          <div className="relative mx-auto lg:mr-0 group">
            <div className="relative w-80 h-[680px] bg-stone-900 rounded-[72px] border-[14px] border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center p-8 ring-4 ring-black/10">
              {/* Earpiece */}
              <div className="w-20 h-2 bg-stone-800 rounded-full mb-10" />

              {/* Screen Area */}
              <div className="w-full flex-1 bg-[#d4e0c4] border-[8px] border-stone-900 p-6 font-mono text-stone-900 overflow-hidden relative shadow-[inset_0_4px_15px_rgba(0,0,0,0.8)] rounded-2xl">
                <div className="absolute top-3 right-4 text-[10px] flex items-center space-x-3 font-black opacity-60">
                  <div className="flex items-end h-3 gap-0.5">
                    <div className="w-1 h-[40%] bg-stone-900" />
                    <div className="w-1 h-[60%] bg-stone-900" />
                    <div className="w-1 h-[80%] bg-stone-900" />
                    <div className="w-1 h-full bg-stone-900" />
                  </div>
                  <span>EDGE</span>
                  <span>100%</span>
                </div>

                <div className="pt-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScreen}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm space-y-4 whitespace-pre-wrap leading-tight font-black tracking-tight"
                    >
                      {current.text}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Input section */}
                <div className="absolute bottom-8 left-6 right-6 border-t-2 border-stone-900/10 pt-4">
                  <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] block mb-2">Reply</span>
                  <div className="flex items-center">
                    <span className="mr-2 font-black text-xl leading-none opacity-60">{">"}</span>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      className="bg-transparent border-none outline-none w-full text-lg font-black placeholder:text-stone-900/10"
                      placeholder="_"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Keys */}
              <div className="w-full mt-10 px-4 flex justify-between">
                 <div className="h-3 w-16 bg-stone-800 rounded-full shadow-inner" />
                 <div className="h-3 w-16 bg-stone-800 rounded-full shadow-inner" />
              </div>

              {/* Main Keypad */}
              <div className="grid grid-cols-3 gap-4 w-full mt-12 px-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(label => (
                  <button
                    key={label}
                    onClick={() => setInput(prev => prev + label)}
                    className="bg-stone-800 h-10 rounded-[14px] flex flex-col items-center justify-center text-stone-500 font-black border-b-[6px] border-stone-950 active:translate-y-1 active:border-b-0 transition-all hover:bg-stone-700 hover:text-white group"
                  >
                    <span className="text-sm leading-none">{label}</span>
                    <span className="text-[6px] opacity-40 group-hover:opacity-100">{
                      label === '2' ? 'ABC' : 
                      label === '3' ? 'DEF' : 
                      label === '4' ? 'GHI' : 
                      label === '5' ? 'JKL' : 
                      label === '6' ? 'MNO' : 
                      label === '7' ? 'PQRS' : 
                      label === '8' ? 'TUV' : 
                      label === '9' ? 'WXYZ' : ''
                    }</span>
                  </button>
                ))}
              </div>

              {/* Home/Send Button Section */}
              <div className="mt-10 flex gap-6">
                 <button onClick={() => navigate('/offline')} className="w-16 h-14 bg-red-950 rounded-full flex items-center justify-center border-b-[6px] border-black text-red-200 active:translate-y-1 active:border-b-0 transition-all shadow-xl"><ChevronLeft className="w-6 h-6" /></button>
                 <button 
                    onClick={() => handleSubmit()}
                    className="w-28 h-14 bg-emerald-800 rounded-[32px] flex items-center justify-center shadow-2xl border-b-[6px] border-emerald-950 active:translate-y-1 active:border-b-0 transition-all group"
                  >
                    <Send className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                 </button>
              </div>
            </div>
            
            {/* Massive phone shadow base */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[100%] h-16 bg-black/40 rounded-[100%] blur-[80px] -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

