import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistance } from "date-fns";

export default function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!chatId || !userId) return;

    const fetchData = async () => {
      try {
        const msgs = await api.getMessages(chatId);
        setMessages(msgs);
        
        // Find partner name (this is a bit complex without a direct chatId metadata)
        // For now, keep it as "Mesh Neighbor"
        setPartner({ id: 'mesh-partner', name: "Mesh Neighbor" });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling for new messages
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('mesh_user_id');
    if (!newMessage.trim() || !userId || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      await api.sendMessage({
        id: `msg_${Date.now()}`,
        jobId: chatId,
        senderId: userId,
        content: messageText
      });
      // Optimized refresh
      const updatedMsgs = await api.getMessages(chatId);
      setMessages(updatedMsgs);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true });
  };

  return (
    <div className="h-screen bg-brand-cream flex flex-col pt- smartphone-view">
      <header className="bg-white px-6 py-8 flex items-center justify-between border-b border-stone-100 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-400 hover:text-brand-red transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-indigo rounded-2xl flex items-center justify-center font-black text-white shrink-0">
              {partner?.name?.[0]}
            </div>
            <div>
              <h1 className="font-black serif text-xl leading-none">{partner?.name}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-olive mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-olive animate-pulse" />
                Active now
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 text-stone-300 hover:text-stone-900 transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="p-3 text-stone-300 hover:text-stone-900 transition-colors"><Video className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4">
        {messages.map((msg, i) => {
          const userId = localStorage.getItem('mesh_user_id');
          const isMe = msg.senderId === userId;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-6 rounded-[28px] ${
                isMe 
                ? 'bg-stone-900 text-white rounded-tr-sm' 
                : 'bg-white text-stone-900 rounded-tl-sm shadow-sm'
              }`}>
                <p className={`serif italic text-lg leading-relaxed ${isMe ? 'text-white' : 'text-stone-600'}`}>
                  {msg.content}
                </p>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 ${isMe ? 'text-white text-right' : 'text-stone-400'}`}>
                  {formatDate(msg.created_at)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      <footer className="p-6 bg-white border-t border-stone-100 shrink-0 pb-smartphone">
        <form onSubmit={handleSend} className="flex gap-4 items-center bg-brand-cream p-2 pl-6 rounded-full shadow-inner border border-black/5">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent py-4 font-black serif italic tracking-tight outline-none placeholder:text-stone-300"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-brand-red text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-brand-brown transition-all disabled:opacity-50 disabled:grayscale active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
