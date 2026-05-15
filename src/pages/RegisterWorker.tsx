import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  ChevronLeft, 
  MapPin, 
  Award, 
  Upload, 
  Camera, 
  Check, 
  Volume2, 
  Play, 
  Pause, 
  Smartphone, 
  Receipt,
  Info,
  ArrowRight,
  Crosshair,
  Loader2
} from 'lucide-react';
import { SKILLS, SKILL_SECTIONS, SKILL_IMAGES } from '../constants';

export default function RegisterWorker() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({
    skills: [] as string[],
    location: '',
    phone: '',
    bio: '',
    photoUrl: '',
    coordinates: null as { lat: number, lng: number } | null
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(SKILL_SECTIONS[0].id);
  const [geoLoading, setGeoLoading] = useState(false);
  
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeout = useRef<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) return;
    
    setLoading(true);
    try {
      let finalPhotoUrl = formData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

      await api.saveUser({
        id: userId,
        phone: formData.phone,
        location: formData.location,
        photoUrl: finalPhotoUrl
      });

      const workerProfile = {
        userId: userId,
        skills: formData.skills,
        experienceYears: 0,
        trustLevel: 'new' as const,
        trustScore: 0,
        badges: [],
        completedJobsCount: 0,
        disputesCount: 0,
        avgRating: 0,
        availability: 'available' as const,
        isVouched: false,
        registrationPaid: true,
        bio: formData.bio,
        lat: formData.coordinates?.lat,
        lng: formData.coordinates?.lng
      };
      
      await api.saveWorkerProfile(workerProfile as any);
      navigate('/smartphone/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const initiateMpesaPayment = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) return;

    setPaymentInitiated(true);
    try {
      await api.initiateSTKPush({
        phone: formData.phone || userId.replace('user_', ''),
        amount: 100,
        type: 'registration',
        userId
      });
      setPaymentSuccess(true);
    } catch (err) {
      console.error(err);
      alert("M-Pesa request failed. Please try again.");
      setPaymentInitiated(false);
    }
  };

  const getCurrentLocation = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode if possible, or just set generic
          const response = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
          const data = await response.json();
          const place = data.features?.[0]?.properties;
          const locationName = place ? `${place.name || ''} ${place.city || place.state || ''}`.trim() : "Current Location";

          setFormData(prev => ({ 
            ...prev, 
            coordinates: { lat: latitude, lng: longitude },
            location: locationName
          }));
        } catch (err) {
          console.error(err);
        } finally {
          setGeoLoading(false);
        }
      }, (error) => {
        console.error(error);
        setGeoLoading(false);
        alert("Please enable location permissions in your browser.");
      });
    } else {
      setGeoLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLocationChange = (val: string) => {
    setFormData(prev => ({ ...prev, location: val }));
    
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    
    if (val.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionTimeout.current = setTimeout(async () => {
      try {
        // Bias towards Kenya area roughly
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lat=-1.2921&lon=36.8219`);
        const data = await response.json();
        setLocationSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Location search failed", err);
      }
    }, 400);
  };

  const selectSuggestion = (feature: any) => {
    const { properties, geometry } = feature;
    const name = [
      properties.name,
      properties.street,
      properties.city || properties.state,
      properties.country
    ].filter(Boolean).slice(0, 2).join(", ");

    setFormData(prev => ({
      ...prev,
      location: name,
      coordinates: {
        lat: geometry.coordinates[1],
        lng: geometry.coordinates[0]
      }
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-brand-cream p-6 flex flex-col max-w-2xl mx-auto selection:bg-brand-red/20 relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5 pointer-events-none" />
      <header className="py-8 flex items-center justify-between relative z-10">
         <button onClick={() => navigate(-1)} className="p-4 hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex space-x-2">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${i <= step ? 'w-10 bg-brand-red' : 'w-2 bg-stone-300'}`} />
          ))}
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1">
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 flex flex-col items-center text-center"
          >
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 rounded-full bg-brand-indigo px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold shadow-xl">
                <Volume2 className="w-3.5 h-3.5" /> Swahili Voice Agreement
              </div>
              <h1 className="text-5xl font-black serif tracking-tight leading-none">Sikiza Jembe.</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">A spoken word is sacred. Sikiliza kwanza.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed max-w-md mx-auto">
                In our community, a handshake and a spoken word build the mesh. Listen to our Swahili Voice Agreement.
              </p>
            </div>

            <div className="w-full max-w-sm bg-white p-10 rounded-[56px] shadow-2xl border border-black/5 space-y-10 relative overflow-hidden">
               <div className="absolute inset-0 kanga-pattern opacity-5 pointer-events-none" />
               <div className="flex justify-center relative z-10">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-brand-gold/20 text-brand-gold scale-105' : 'bg-brand-indigo text-white shadow-2xl active:scale-95'}`}
                  >
                    {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-2" />}
                  </button>
               </div>
               
               <div className="space-y-3 relative z-10">
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={isPlaying ? { width: '100%' } : { width: '0%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                      className="h-full bg-brand-red"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">
                     <span>{isPlaying ? 'Listening to JembeAI' : 'Voice Agreement'}</span>
                     <span className="text-stone-900">1:30</span>
                  </div>
               </div>

               <button 
                onClick={() => setTosAccepted(!tosAccepted)}
                className={`w-full py-6 rounded-[24px] flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-xs transition-all relative z-10 ${tosAccepted ? 'bg-brand-indigo text-white shadow-xl' : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-brand-red/20'}`}
               >
                 {tosAccepted ? <Check className="w-5 h-5" /> : null}
                 {tosAccepted ? "I Accept Spoken ToS" : "I Agree to Speak"}
               </button>
            </div>
            
            <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest max-w-xs leading-relaxed">
               By pressing 1 or clicking accept, you create a digital signature timestamped with your identity.
            </p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 flex flex-col items-center text-center"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-black serif leading-none tracking-tighter">Your Honor Card</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Picha yako, heshima yako.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed max-w-sm mx-auto">Profiles with clear photos build instant trust and get 3x more requests.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-[48px] sm:rounded-[64px] bg-white border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-red group-hover:shadow-2xl group-hover:scale-105 duration-500">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover scale-110 active:scale-100 transition-transform" />
                ) : (
                  <Camera className="w-16 h-16 text-stone-200 group-hover:text-brand-red transition-all duration-500" />
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-brand-indigo text-brand-gold p-6 rounded-[32px] shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border-4 border-brand-cream">
                <Upload className="w-6 h-6" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div className="bg-brand-gold/10 p-8 rounded-[40px] border border-brand-gold/20 flex gap-6 max-w-md shadow-sm">
               <div className="p-4 bg-white rounded-[24px] h-fit border border-brand-gold/30 shadow-xl text-brand-brown">
                  <Award className="w-6 h-6" />
               </div>
               <p className="text-lg text-brand-brown text-left serif leading-relaxed italic">
                  Tip: A clear face photo makes your **Community Introducer’s** job easier when they vouch for you.
               </p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <h1 className="text-5xl font-black serif leading-none tracking-tighter">Your Jua Kali Skills</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Ujuzi wako, maisha yako.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed">Select your skills. The sections help categorize your expertise.</p>
            </div>

            <div className="space-y-8">
              <div className="flex border-b border-stone-100 overflow-x-auto scrollbar-hide -mx-6 px-6 gap-8">
                {SKILL_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`pb-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                      activeTab === section.id ? 'text-brand-indigo' : 'text-stone-400 hover:text-brand-red'
                    }`}
                  >
                    {section.title}
                    {activeTab === section.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-indigo rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 outline-none">
                {SKILL_SECTIONS.find(s => s.id === activeTab)?.skills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`p-2 rounded-[32px] border-2 transition-all text-xs font-black tracking-[0.1em] flex items-center gap-4 group active:scale-95 text-left ${
                      formData.skills.includes(skill) 
                        ? 'bg-brand-indigo text-white border-transparent shadow-2xl ring-4 ring-brand-indigo/10' 
                        : 'bg-white text-stone-700 border-stone-50 hover:border-brand-red/20 hover:shadow-lg'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/5 bg-stone-50">
                      <img 
                        src={SKILL_IMAGES[skill] || null} 
                        alt={skill} 
                        className={`w-full h-full object-cover transition-all duration-500 ${formData.skills.includes(skill) ? 'grayscale-0 opacity-100 scale-110' : 'grayscale group-hover:grayscale-0 opacity-70'}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                       <p className="truncate text-sm">{skill.split('(')[0].trim()}</p>
                       {skill.includes('(') && (
                         <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${formData.skills.includes(skill) ? 'text-brand-gold' : 'text-stone-400'}`}>
                           {skill.split('(')[1].replace(')', '')}
                         </p>
                       )}
                    </div>
                    {formData.skills.includes(skill) ? (
                       <Check className="w-5 h-5 text-brand-gold mr-4 shrink-0" />
                    ) : (
                       <ArrowRight className="w-4 h-4 text-stone-200 group-hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100 mr-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-stone-100 mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-6 px-4">Selected Skills</p>
                <div className="flex flex-wrap gap-3">
                  {formData.skills.length === 0 ? (
                    <p className="text-stone-300 italic serif px-4">No skills selected yet...</p>
                  ) : (
                    formData.skills.map(skill => (
                      <div key={skill} className="bg-brand-cream border border-black/5 px-6 py-3 rounded-full flex items-center gap-3">
                        <span className="text-xs font-black tracking-tight">{skill}</span>
                        <button onClick={() => toggleSkill(skill)} className="text-brand-red hover:scale-110 transition-transform">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <h1 className="text-5xl font-black serif leading-none tracking-tighter">Your Details</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Habari zako, kwa jumuiya.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed">How can clients and vouchers reach you? Your dignity starts with your data.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">M-Pesa Number</label>
                <input 
                  type="tel"
                  placeholder="07..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white p-8 rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-xl serif tracking-tight"
                />
              </div>

              <div className="space-y-3 relative">
                <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4 flex justify-between items-center">
                  <span>Primary Neighborhood</span>
                  {geoLoading && <span className="animate-pulse text-brand-red">Locating...</span>}
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-red w-6 h-6" />
                  <input 
                    type="text"
                    placeholder="e.g. Kasarani, Nairobi"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full bg-white p-5 pl-14 pr-16 sm:p-8 sm:pl-20 sm:pr-32 rounded-[24px] sm:rounded-[32px] shadow-xl border-2 sm:border-4 border-transparent focus:border-brand-red focus:outline-none font-black text-base sm:text-xl serif tracking-tight"
                  />
                  <button 
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={geoLoading}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-brand-cream rounded-2xl text-brand-indigo hover:text-brand-red transition-colors border border-black/5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-[32px] shadow-2xl border border-stone-100 overflow-hidden py-4"
                    >
                      {locationSuggestions.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectSuggestion(f)}
                          className="w-full px-8 py-6 text-left hover:bg-stone-50 transition-colors flex items-center gap-6 group"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-brand-cream flex items-center justify-center text-stone-300 group-hover:text-brand-red transition-colors">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-lg serif text-stone-900 leading-none">
                              {f.properties.name || f.properties.street || "Unknown Place"}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1.5">
                              {[f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

               <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-stone-400 tracking-[0.3em] pl-4">Your Story (Bio)</label>
                <textarea 
                  rows={4}
                  placeholder="I am known for clean finishes in painting and reliability..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-white p-8 rounded-[32px] shadow-xl border-4 border-transparent focus:border-brand-red focus:outline-none serif italic text-xl resize-none leading-relaxed"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 flex flex-col items-center text-center"
          >
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 rounded-full bg-brand-indigo px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl">
                 <Smartphone className="w-4 h-4 text-brand-gold animate-pulse" /> STK Push Verification
              </div>
              <h1 className="text-5xl font-black serif tracking-tight">Onboarding Fee.</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Ada ya kuanza. KES 100 pekee.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed max-w-sm mx-auto">
                A one-time community trust fee to verify your digital identity and activate your profile.
              </p>
            </div>

            <div className="w-full max-w-sm bg-white p-12 rounded-[64px] shadow-2xl space-y-10 relative overflow-hidden group">
               <div className="absolute inset-0 kanga-pattern opacity-5" />
               <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-3">Total Commitment</p>
                  <p className="text-7xl font-black tracking-tighter serif text-stone-900 leading-none">KES 100</p>
                  
                  <div className="mt-12 space-y-6">
                     {!paymentInitiated ? (
                       <button 
                         onClick={initiateMpesaPayment}
                         className="w-full py-7 bg-brand-indigo text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl hover:bg-brand-brown transition-all group active:scale-95"
                       >
                         Pay via M-Pesa <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </button>
                     ) : !paymentSuccess ? (
                       <div className="flex flex-col items-center gap-6 py-4">
                          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-red animate-pulse">Waiting for M-Pesa PIN...</p>
                       </div>
                     ) : (
                       <motion.div 
                         initial={{ scale: 0.9, opacity: 0 }} 
                         animate={{ scale: 1, opacity: 1 }}
                         className="bg-brand-gold/10 p-8 rounded-[40px] text-brand-brown space-y-3 border border-brand-gold/20"
                       >
                          <div className="flex justify-center mb-4">
                             <div className="w-16 h-16 bg-brand-indigo rounded-full flex items-center justify-center text-brand-gold shadow-xl">
                                <Check className="w-8 h-8" />
                             </div>
                          </div>
                          <p className="font-black text-2xl serif leading-none">Hamsini Imekubaliwa!</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">TXN: QRT82NKLA0</p>
                       </motion.div>
                     )}
                  </div>
               </div>
               
               <Check className="absolute -bottom-16 -right-16 w-64 h-64 text-stone-50 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">
               <Receipt className="w-4 h-4 text-brand-gold" /> Secure via Safaricom STK
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="space-y-4 text-center">
               <div className="inline-flex items-center gap-3 rounded-full bg-brand-gold/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-brown shadow-sm border border-brand-gold/20">
                <Info className="w-4 h-4" /> Radically Transparent
              </div>
              <h1 className="text-5xl font-black serif tracking-tight leading-none">Where your money goes.</h1>
              <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Uwazi wa kifedha.</p>
              <p className="text-stone-500 serif italic text-lg leading-relaxed max-w-sm mx-auto">
                No platform profit. Your 100 bob powers the community ledger.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[64px] shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 kanga-pattern opacity-5 pointer-events-none" />
               <div className="relative z-10 space-y-8">
                  {[
                    { label: "USSD / SMS Credits", amount: 40, desc: "Pays for your offline status updates." },
                    { label: "Digital Trust ID Card", amount: 30, desc: "Managing your permanent jua kali QR card." },
                    { label: "Community Mesh Ledger", amount: 20, desc: "Keeping the SkillMesh infrastructure active." },
                    { label: "Neighborhood Training", amount: 10, desc: "Assisting elders and introducers." }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start group">
                       <div className="space-y-1">
                          <p className="font-black text-stone-900 group-hover:text-brand-red transition-colors text-lg serif tracking-tight">{item.label}</p>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{item.desc}</p>
                       </div>
                       <div className="text-2xl font-black serif text-brand-indigo">KES {item.amount}</div>
                    </div>
                  ))}
                  
                  <div className="pt-8 border-t border-stone-100 flex justify-between items-center">
                     <p className="font-black uppercase tracking-[0.3em] text-stone-400 text-xs">Total Onboarding</p>
                     <p className="text-4xl font-black serif text-stone-900">KES 100</p>
                  </div>
               </div>
            </div>

            <div className="bg-brand-indigo p-10 rounded-[48px] text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 kanga-pattern opacity-10 pointer-events-none" />
               <div className="relative z-10 space-y-4">
                  <p className="font-black uppercase tracking-[0.3em] text-[10px] text-brand-gold">What happens next?</p>
                  <h3 className="text-3xl font-black serif leading-[0.95] tracking-tight">Trust Level: 0.<br/><span className="text-brand-gold italic">Awaiting Vouch.</span></h3>
                  <p className="serif italic leading-relaxed text-lg text-white/70">
                     To reach Level 1 and become visible to clients, a **Community Introducer** (Leader, Elder, or Pastor) must vouch for your skill via USSD code `*555*11#`.
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="py-10 flex space-x-6 relative z-10">
        {step > 0 && (
          <button 
            onClick={handleBack}
            className="p-8 bg-white rounded-[32px] text-stone-400 font-black uppercase tracking-widest text-xs hover:text-stone-900 hover:shadow-xl transition-all border border-stone-100 active:scale-95"
          >
            Back
          </button>
        )}
        <button 
          onClick={step === 5 ? handleSubmit : handleNext}
          disabled={
            loading || 
            (step === 0 && !tosAccepted) ||
            (step === 1 && !photoPreview) ||
            (step === 2 && formData.skills.length === 0) ||
            (step === 3 && (!formData.phone || !formData.location)) ||
            (step === 4 && !paymentSuccess)
          }
          className={`flex-1 py-8 rounded-[32px] font-black uppercase tracking-[0.25em] text-sm shadow-2xl transition-all active:scale-95 disabled:opacity-50 border-b-4 ${step === 5 ? 'bg-brand-red text-white border-brand-brown hover:bg-brand-brown' : 'bg-brand-indigo text-white border-brand-indigo hover:opacity-90'}`}
        >
          {loading ? 'Finalizing Profile...' : step === 5 ? 'Launch My Profile' : 'Continue (Endelea)'}
        </button>
      </div>
    </div>
  );
}
