import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Sparkles, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SMS = {
  id: string;
  text: string;
  sender: 'user' | 'system';
  time: string;
};

export default function SMSSimulator() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<SMS[]>([
    { id: '1', text: "Welcome to FundiConnect SMS. Text 'REGISTER' to start or 'FIND skill location' to find a worker.", sender: 'system', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: SMS = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate system response
    setTimeout(() => {
      let response = "SMS received. Our agent will call you shortly to confirm your request.";
      const lower = input.toLowerCase();
      
      if (lower.includes('register')) {
        response = "Reply with: NAME, SKILL, LOCATION. Example: 'John Doe, Plumber, Ruiru'";
      } else if (lower.includes('find')) {
        response = "We found 3 verified fundis matching your request. Their names and contact will be sent to you via SMS in a moment.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'system',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
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
            Back
          </button>
          <div className="flex items-center gap-3 px-5 py-2 bg-brand-indigo text-brand-gold rounded-full shadow-xl text-[10px] font-black uppercase tracking-[0.3em]">
             SMS Mesh Gateway <MessageCircle className="w-4 h-4" />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start pb-20">
          <div className="space-y-10">
             <div className="inline-flex items-center gap-3 rounded-full bg-brand-indigo/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-indigo shadow-sm border border-brand-indigo/20">
              <Sparkles className="w-4 h-4" /> Text-based access
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter serif leading-[0.9]">
              Simple SMS.<br/><span className="text-brand-red">Powerful Results.</span>
            </h1>
            <p className="text-2xl text-brand-indigo font-black serif italic opacity-80 leading-none">Ujumbe rahisi, matokeo bora.</p>
            <p className="text-xl text-stone-500 serif italic leading-relaxed max-w-md">
              The SMS channel is designed for zero-data zones. No internet, just basic text messages to connect to the ledger.
            </p>
            <div className="p-10 bg-white rounded-[48px] border border-stone-100 shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute inset-0 kanga-pattern opacity-[0.03] pointer-events-none" />
               <h3 className="font-black text-stone-900 uppercase tracking-[0.3em] text-[10px] pb-2 border-b border-stone-50">Local Mesh Commands</h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center p-5 bg-brand-indigo/5 rounded-[24px] border border-brand-indigo/10">
                     <code className="text-brand-red font-black text-lg">REGISTER</code>
                     <span className="text-xs text-stone-400 font-black uppercase tracking-widest italic">Start Registration</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-brand-indigo/5 rounded-[24px] border border-brand-indigo/10">
                     <code className="text-brand-red font-black text-lg text-xs leading-none">FIND PLUMBER RUIRU</code>
                     <span className="text-xs text-stone-400 font-black uppercase tracking-widest italic">Request Help</span>
                  </div>
               </div>
            </div>
          </div>

          {/* SMS Interface */}
          <div className="w-full max-w-md mx-auto lg:mr-0 bg-stone-900 rounded-[72px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden border-[12px] border-stone-800 h-[740px] flex flex-col group">
             <div className="p-8 text-center border-b border-white/5 bg-black/20">
                <p className="text-brand-gold font-black text-2xl tracking-tighter serif">22334</p>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-1">FundiConnect Gateway</p>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-black/10">
               <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`flex ${msg.sender === 'system' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-[32px] p-6 shadow-2xl relative ${
                        msg.sender === 'system' 
                          ? 'bg-stone-800 text-white rounded-tl-none ring-1 ring-white/5' 
                          : 'bg-brand-red text-white rounded-tr-none'
                      }`}>
                        <p className="text-lg font-medium leading-relaxed tracking-tight serif italic">{msg.text}</p>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[9px] opacity-40 font-black uppercase tracking-[0.3em]">{msg.time}</p>
                          {msg.sender === 'system' && <MessageCircle className="w-3 h-3 opacity-20" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
             </div>

             <div className="p-6 bg-stone-900/80 backdrop-blur-xl border-t border-white/5">
                <div className="flex items-center gap-4 bg-stone-800 rounded-[32px] p-2 ring-1 ring-white/5">
                   <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Command frequency..."
                     className="flex-1 bg-transparent border-none outline-none text-white text-base font-black placeholder:text-white/10 px-6"
                   />
                   <button 
                    onClick={handleSend}
                    className="w-14 h-14 bg-brand-red text-white rounded-full flex items-center justify-center hover:bg-brand-indigo hover:text-brand-gold transition-all shadow-2xl active:scale-95 group"
                   >
                     <Send className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
