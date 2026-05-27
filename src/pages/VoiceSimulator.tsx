import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mic, MicOff, Volume2, Phone, Sparkles, PhoneOff, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Message = {
  role: 'assistant' | 'user';
  text: string;
};

export default function VoiceSimulator() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Habari! Welcome to FundiConnect. I am Jembe, your community voice assistant. Would you like to register your skill or are you looking for a professional fundi?" }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = (userInput: string) => {
    let response = "I'm sorry, I didn't quite catch that. Could you repeat?";
    const lower = userInput.toLowerCase();

    if (lower.includes('work') || lower.includes('job') || lower.includes('skill') || lower.includes('register')) {
      response = "Great! What is your primary skill? For example: carpenter, plumber, or electrician?";
    } else if (lower.includes('plumber') || lower.includes('electrician') || lower.includes('carpenter')) {
      response = "Excellent. And which neighborhood are you in? (e.g. Ruiru, Kasarani, or Pipeline)";
    } else if (lower.includes('ruiru') || lower.includes('kasarani') || lower.includes('pipeline')) {
      response = "Thank you. Your profile is now being processed by the community truth engine. We will SMS you once verified. Asante!";
    } else if (lower.includes('service') || lower.includes('need') || lower.includes('fix')) {
      response = "I can help with that. What service do you need today?";
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      setIsSpeaking(true);
      // Voice feedback duration simulation
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 1200);
  };

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate speech detection after a small delay
      setTimeout(() => {
        const mockInputs = ["I want to register as a plumber", "I am in Kasarani", "I need someone to fix my wiring"];
        const randomInput = mockInputs[Math.floor(Math.random() * mockInputs.length)];
        setMessages(prev => [...prev, { role: 'user', text: randomInput }]);
        setIsListening(false);
        simulateResponse(randomInput);
      }, 2500);
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
            Back to Channels
          </button>
          <div className="flex items-center gap-3 px-5 py-2 bg-brand-indigo text-brand-gold rounded-full shadow-xl text-[10px] font-black uppercase tracking-[0.3em]">
             JembeAI Frequency <Volume2 className="w-4 h-4" />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-16 items-start pb-20">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-brand-red/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-red shadow-sm border border-brand-red/20">
              <Sparkles className="w-4 h-4" /> Zero Literacy Mode
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter serif leading-[0.9]">
              Just say the word.<br/><span className="text-brand-red">No typing.</span>
            </h1>
            <p className="text-2xl text-brand-indigo font-black serif italic opacity-80 leading-none">Sema neno, tutafanya mengine.</p>
            <p className="text-xl text-stone-500 serif italic leading-relaxed max-w-md">
              For artisans who prefer speaking over typing—especially in Swahili—JembeAI bridges the tech gap with dignity.
            </p>
            
            <div className="grid gap-6">
              {[
                { title: "Speaks Swahili", text: "Supports Sheng, Swahili, and English dialects.", color: "bg-brand-red text-white" },
                { title: "Zero Typing", text: "Ideal for manual workers busy with their tools.", color: "bg-brand-indigo text-brand-gold" }
              ].map((item) => (
                <div key={item.title} className="p-8 bg-white rounded-[40px] border border-stone-100 flex gap-6 shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 ${item.color} rounded-[20px] flex items-center justify-center shrink-0 shadow-lg`}>
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-stone-900 serif leading-none">{item.title}</h3>
                     <p className="text-lg text-stone-500 serif italic mt-2">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Interface Simulator */}
          <div className="w-full bg-white rounded-[64px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col h-[780px] relative overflow-hidden group">
            {/* Audio Visualization Header */}
            <div className="bg-brand-indigo p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 kanga-pattern opacity-10" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-brand-gold animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Frequency: 0800-FUNDI</p>
                  </div>
                  <h2 className="text-4xl font-black serif tracking-tighter">JembeAI Assistant</h2>
                </div>
                <button 
                  onClick={() => navigate('/offline')}
                  className="w-14 h-14 bg-white/10 text-brand-red rounded-[24px] flex items-center justify-center hover:bg-brand-red hover:text-white transition-all shadow-xl backdrop-blur-md"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
              
              {/* Waveform Visualization */}
              <div className="flex items-end justify-center h-24 gap-2 mt-10 relative z-10">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isSpeaking || isListening ? { 
                      height: [15, Math.random() * 80 + 15, 15] 
                    } : { height: 8 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 + Math.random() * 0.5,
                      delay: i * 0.04 
                    }}
                    className={`w-2 rounded-full shadow-lg ${isSpeaking ? 'bg-brand-gold' : isListening ? 'bg-brand-red' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 p-10 overflow-y-auto space-y-8 scroll-smooth bg-brand-cream/10 relative"
            >
              <div className="absolute inset-0 kanga-pattern opacity-[0.03] pointer-events-none" />
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[90%] p-8 rounded-[40px] shadow-2xl relative ${
                        msg.role === 'assistant' 
                          ? 'bg-white text-stone-900 rounded-tl-none border border-stone-100' 
                          : 'bg-brand-indigo text-white rounded-tr-none shadow-brand-indigo/20'
                      }`}
                    >
                      <div className={`flex items-center gap-3 mb-3 opacity-40 ${msg.role === 'assistant' ? 'text-brand-red' : 'text-brand-gold'}`}>
                        {msg.role === 'assistant' ? <Volume2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                          {msg.role === 'assistant' ? 'Jembe (Sema)' : 'You (Speaking)'}
                        </span>
                      </div>
                      <p className={`text-xl leading-relaxed tracking-tight ${msg.role === 'assistant' ? 'serif italic font-medium' : 'font-black'}`}>
                        {msg.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-12 flex flex-col items-center gap-8 bg-white border-t-4 border-stone-50 relative z-10">
              <div className="relative">
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.8, opacity: 0.4 }}
                      exit={{ scale: 2.2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 bg-brand-red rounded-full"
                    />
                  )}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMicClick}
                  className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 ${
                    isListening ? 'bg-brand-red text-white scale-110' : 'bg-brand-indigo text-brand-gold'
                  }`}
                >
                  <Mic className={`w-12 h-12 ${isListening ? 'animate-pulse' : ''}`} />
                </motion.button>
              </div>
              
              <div className="text-center">
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${isListening ? 'text-brand-red' : 'text-stone-400'}`}>
                  {isListening ? "Listening to your voice..." : "Tap the Jembe frequency to speak"}
                </p>
                {isSpeaking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-brand-indigo text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center justify-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-ping" /> Jembe is speaking...
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

