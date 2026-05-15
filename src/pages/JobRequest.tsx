import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Send, 
  User, 
  X,
  Crosshair,
  Loader2
} from 'lucide-react';
import { Job, Urgency, WorkerProfile, User as AppUser } from '../types';
import { SKILLS, SKILL_SECTIONS } from '../constants';

import { PageContainer, PageHeader } from '../components/standard/AppShell';

export default function JobRequest() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    skillNeeded: '',
    description: '',
    location: '',
    urgency: 'today' as Urgency,
    budget: '',
    workerId: '' as string | undefined,
    workerName: '' as string | undefined,
    coordinates: null as { lat: number, lng: number } | null
  });
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { skill, workerId, workerName, location: workerLocation } = location.state;
      setFormData(prev => ({
        ...prev,
        skillNeeded: skill || prev.skillNeeded,
        workerId: workerId || prev.workerId,
        workerName: workerName || prev.workerName,
        location: workerLocation || prev.location
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) return;
    
    setLoading(true);
    try {
      const jobId = `job_${Date.now()}`;
      const jobData = {
        id: jobId,
        clientId: userId,
        workerId: formData.workerId,
        skillNeeded: formData.skillNeeded,
        description: formData.description,
        location: formData.location,
        lat: formData.coordinates?.lat,
        lng: formData.coordinates?.lng,
        urgency: formData.urgency,
        budget: formData.budget,
        status: 'open' as const,
      };

      await api.createJob(jobData as any);
      navigate(`/smartphone/dashboard`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ 
          ...prev, 
          coordinates: { lat: latitude, lng: longitude },
          location: formData.location || "Current Location" 
        }));
        setGeoLoading(false);
      }, (error) => {
        console.error(error);
        setGeoLoading(false);
        alert("Please enable location permissions.");
      });
    } else {
      setGeoLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Post a Request" 
        subtitle="Omba Huduma"
      />

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-12 pb-20 mt-8">
        <div className="space-y-8">
          {formData.workerName && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-indigo/5 border border-brand-indigo/10 p-6 rounded-[32px] flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-brand-indigo rounded-2xl flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Direct Request To</p>
                <p className="text-xl font-black serif text-stone-900 leading-tight">Fundi {formData.workerName}</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, workerId: undefined, workerName: undefined }))}
                className="p-2 hover:bg-brand-red/10 rounded-full text-brand-red transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">What service is needed?</label>
            <select 
              value={formData.skillNeeded}
              onChange={(e) => setFormData({...formData, skillNeeded: e.target.value})}
              required
              className="w-full bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-xl serif tracking-tight appearance-none cursor-pointer"
            >
              <option value="">Select a service...</option>
              {SKILL_SECTIONS.map(section => (
                <optgroup key={section.id} label={section.title} className="font-bold text-stone-400 bg-stone-50">
                  {section.skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </optgroup>
              ))}
              <option value="Other">Other / Ingineo</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">Details of the task</label>
            <textarea 
              rows={4}
              placeholder="e.g. My sink is leaking and I need someone to fix the pipe under the cabinet."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              className="w-full bg-white p-8 rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none serif italic text-xl resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">Where are you located?</label>
              <div className="relative group">
                <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-red w-6 h-6" />
                <input 
                  type="text"
                  placeholder="Street or Estate"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  className="w-full bg-white p-8 pl-20 pr-24 rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-xl serif tracking-tight"
                />
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={geoLoading}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-brand-cream rounded-2xl text-brand-indigo hover:text-brand-red transition-all shadow-sm border border-black/5 active:scale-95 disabled:opacity-50"
                >
                  {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">Budget (KES)</label>
              <div className="relative">
                <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-red w-6 h-6" />
                <input 
                  type="text"
                  placeholder="e.g. 2000 - 3000"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full bg-white p-8 pl-20 rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-xl serif tracking-tight"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">How urgent is it?</label>
            <div className="flex flex-wrap gap-4">
              {(['today', 'this_week', 'flexible'] as Urgency[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setFormData({...formData, urgency: u})}
                  className={`flex-1 min-w-[100px] p-5 sm:p-6 rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border-4 ${
                    formData.urgency === u 
                      ? 'bg-brand-indigo text-white border-brand-indigo shadow-xl scale-105' 
                      : 'bg-white text-stone-400 border-transparent hover:border-brand-red/20'
                  }`}
                >
                  {u.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-8 bg-brand-red text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center space-x-4 hover:shadow-brand-red/20 transition-all disabled:opacity-50 border-b-8 border-brand-brown active:translate-y-1 active:border-b-4"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-6 h-6" />
              <span>Broadcast Request</span>
            </>
          )}
        </button>
      </form>
    </PageContainer>
  );
}
