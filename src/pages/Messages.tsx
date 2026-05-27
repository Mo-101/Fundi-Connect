import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { MessageSquare, Search, ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { formatDistance } from "date-fns";

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

export default function Messages() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) {
      navigate('/smartphone/auth');
      return;
    }

    // MOCKING chats for now
    setChats([]);
    setLoading(false);
  }, [navigate]);

  return (
    <PageContainer>
      <PageHeader 
        title="Gumzo." 
        subtitle="Your connections and job discussions."
        action={
          <div className="bg-brand-red text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-xl">
            {chats.length}
          </div>
        }
      />

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5 group-focus-within:text-brand-indigo transition-colors" />
          <input 
            type="text" 
            placeholder="Search connections..." 
            className="w-full bg-white p-6 pl-16 rounded-[28px] shadow-sm outline-none border-4 border-transparent focus:border-brand-indigo/10 font-black serif italic tracking-tight transition-all"
          />
        </div>

        {loading ? (
          <LoadingState message="Retrieving your gumzo..." />
        ) : (
          <div className="space-y-4 pb-20">
            {chats.length === 0 ? (
              <EmptyState 
                message="No conversations yet. Book a fundi to start the dialogue."
                icon={MessageSquare}
              />
            ) : (
              chats.map((chat) => (
                <motion.div
                  layout
                  key={chat.id}
                  onClick={() => navigate(`/smartphone/chat/${chat.id}`)}
                  className="bg-white rounded-[32px] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-95 border border-stone-100"
                >
                  <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-xl font-black text-brand-indigo shrink-0">
                    {/* Placeholder for participant name initial */}
                    {chat.participants.find((p: string) => p !== localStorage.getItem('mesh_user_id'))?.[0]}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-black serif text-xl tracking-tight text-stone-900 truncate">
                        {/* In a real app, look up user profile names */}
                        Connection
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                        {chat.lastMessageAt && formatDistance(chat.lastMessageAt.toDate(), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-stone-500 serif italic truncate">
                      {chat.lastMessage || "Start the conversation..."}
                    </p>
                  </div>
                  <button className="p-2 text-stone-200 hover:text-stone-900 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
