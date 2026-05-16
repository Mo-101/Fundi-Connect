import * as React from "react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { motion } from "motion/react";
import { Star, Hammer, ShieldCheck, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SKILL_IMAGES } from "../constants";
import { User, WorkerProfile } from "../types";

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState } from '../components/standard/StateComponents';

export default function Community() {
  const [workers, setWorkers] = useState<(User & WorkerProfile)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.getWorkers()
      .then(w => setWorkers(w as any))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skills = ['All', ...Array.from(new Set(workers.flatMap(w => w.skills ?? []))).sort()];

  const filtered = filter === 'All'
    ? workers
    : workers.filter(w => w.skills?.includes(filter));

  return (
    <PageContainer>
      <PageHeader
        title="Community Baraza."
        subtitle="All registered fundis in the mesh."
      />

      {/* Asante Drop banner */}
      <button
        onClick={() => navigate('/smartphone/asante-drop')}
        className="w-full bg-brand-red/5 border border-brand-red/10 rounded-[28px] p-5 flex items-center gap-4 mb-6 hover:bg-brand-red/10 transition-colors active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-brand-red/10 rounded-2xl flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-brand-red fill-brand-red/30" />
        </div>
        <div className="text-left">
          <p className="font-black text-stone-800 text-sm">Support FundiConnect</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Asante Drop · Voluntary · KES 10–100</p>
        </div>
        <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-brand-red">Drop →</span>
      </button>

      {loading ? (
        <LoadingState message="Loading fundis..." />
      ) : (
        <>
          {/* Skill filter pills */}
          {skills.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {skills.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === s
                      ? 'bg-brand-indigo text-white shadow-md'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <Hammer className="w-8 h-8 text-stone-200" />
              </div>
              <p className="text-stone-500 serif italic text-lg">No fundis registered yet.</p>
              <button
                onClick={() => navigate('/smartphone/register-skill')}
                className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-indigo underline underline-offset-4 decoration-2"
              >
                Register your skill →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((worker) => (
                <WorkerCard key={worker.userId ?? worker.id} worker={worker} />
              ))}
            </div>
          )}

          <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-stone-300 mt-10">
            {filtered.length} fundi{filtered.length !== 1 ? 's' : ''} in the mesh
          </p>
        </>
      )}
    </PageContainer>
  );
}

function WorkerCard({ worker }: { worker: User & WorkerProfile }) {
  const navigate = useNavigate();
  const skill = worker.skills?.[0] || '';

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/smartphone/category/${encodeURIComponent(skill)}`)}
      className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-xl bg-stone-100 text-left"
      style={{ minHeight: 200 }}
    >
      {SKILL_IMAGES[skill] && (
        <img
          src={SKILL_IMAGES[skill]}
          alt={skill}
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.1]"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex justify-between items-start">
          {worker.trustLevel === 'verified' && (
            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
            </div>
          )}
          {worker.lat && (
            <div className="ml-auto bg-white/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              <MapPin className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div>
          <p className="text-xl font-black leading-tight serif text-white drop-shadow-md">
            {worker.name?.split(' ')[0]}.
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold mt-1 opacity-90">
            {skill}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
            <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">
              {worker.trustScore ?? 0}% Trust
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
