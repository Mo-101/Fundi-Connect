/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Check, 
  Upload, 
  Camera, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  Coins, 
  Smartphone, 
  Receipt, 
  Info, 
  ArrowRight, 
  Crosshair, 
  Loader2,
  Lock,
  ChevronLeft
} from "lucide-react";
import { NeonCard, KenteStrip } from "./CyberDeck";
import { Worker } from "../types";

interface RegisterWorkerWizardProps {
  onComplete: (data: {
    name: string;
    phone: string;
    locationName: string;
    bio: string;
    skills: string[];
    avatar: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  onCancel: () => void;
}

const CATEGORIES_MAPPING = [
  {
    title: "Electrical Nodes",
    skills: ["Power Grid Retrofit", "Hybrid Solar Wire", "Smart Meter Calibrator", "Photovoltaic Solder"]
  },
  {
    title: "Eco Plumbing",
    skills: ["Hydro-flow Plumbing", "Bio-digester Leak Seal", "Wastewater Valve Fitting", "Hot Water IoT Nodes"]
  },
  {
    title: "Cyber Board & Tech",
    skills: ["Motherboard Board Solder", "Kiosk OS Configuration", "MiniPay Node Terminal", "GSM Field Radio Sync"]
  },
  {
    title: "Structural Crafts",
    skills: ["Precision Kin Joinery", "High-Seismic Concrete", "Sustainable Timber Frame", "Ceramic Tile Geometry"]
  }
];

export function RegisterWorkerWizard({ onComplete, onCancel }: RegisterWorkerWizardProps) {
  const [step, setStep] = useState<number>(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: -1.2921, lng: 36.8219 }); // default Nairobi
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=juma");

  // Agreement State
  const [isPlayingAgreement, setIsPlayingAgreement] = useState(false);
  const [agreementMuted, setAgreementMuted] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);
  const [agreementProgress, setAgreementProgress] = useState(0);

  // Photo State
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Location suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const suggestionTimeout = useRef<any>(null);

  // M-Pesa State
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "waiting" | "confirmed" | "failed">("idle");
  const [paymentSkipped, setPaymentSkipped] = useState(false);

  // Oath Handshake States
  const [oathTruth, setOathTruth] = useState(false);
  const [oathApprentice, setOathApprentice] = useState(false);
  const [oathElder, setOathElder] = useState(false);
  const [oathHoldProgress, setOathHoldProgress] = useState(0);
  const [isHoldingOath, setIsHoldingOath] = useState(false);
  const [oathSealed, setOathSealed] = useState(false);

  // Oath hold handler loop
  useEffect(() => {
    let interval: any;
    if (isHoldingOath && !oathSealed) {
      interval = setInterval(() => {
        setOathHoldProgress((p) => {
          if (p >= 100) {
            setOathSealed(true);
            setIsHoldingOath(false);
            return 100;
          }
          return p + 4; // reaches 100 in ~0.75 seconds of holding
        });
      }, 30);
    } else if (!isHoldingOath && !oathSealed) {
      // drain progress when released
      interval = setInterval(() => {
        setOathHoldProgress((p) => Math.max(0, p - 8));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isHoldingOath, oathSealed]);

  // Audio agreement loop simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAgreement) {
      interval = setInterval(() => {
        setAgreementProgress((p) => {
          if (p >= 100) {
            setIsPlayingAgreement(false);
            return 100;
          }
          return p + 2.5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAgreement]);

  // Handle location reverse geo or suggestions fetch via Photon Komoot
  const handleLocationInputChange = (val: string) => {
    setLocationName(val);
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionTimeout.current = setTimeout(async () => {
      try {
        // Bias search towards Kenya coordinates
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lat=-1.2921&lon=36.8219`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn("Photon suggestions failed", err);
      }
    }, 400);
  };

  const selectSuggestion = (f: any) => {
    const { properties, geometry } = f;
    const name = [
      properties.name,
      properties.city || properties.state || properties.county,
      properties.country
    ].filter(Boolean).slice(0, 2).join(", ");

    setLocationName(name);
    setCoordinates({
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0]
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Get current physical coordinate
  const handleGeolocate = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          try {
            const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
            if (res.ok) {
              const data = await res.json();
              const place = data.features?.[0]?.properties;
              if (place) {
                const label = [place.name, place.city || place.state || place.county].filter(Boolean).join(", ");
                setLocationName(label || "Current Device Node");
              } else {
                setLocationName("Device Coords Locked");
              }
            } else {
              setLocationName("Device Coords Locked");
            }
          } catch (err) {
            setLocationName("Device Coords Locked");
          } finally {
            setGeoLoading(false);
          }
        },
        () => {
          setGeoLoading(false);
        }
      );
    } else {
      setGeoLoading(false);
    }
  };

  // M-Pesa Simulated STK push
  const triggerMpesa = () => {
    if (!phone) {
      alert("Specify valid technician phone contact!");
      return;
    }
    setPaymentStatus("waiting");
    setTimeout(() => {
      // simulate success
      setPaymentStatus("confirmed");
    }, 4000);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleFinalize = () => {
    onComplete({
      name: fullName || "Anonymous Technician",
      phone: phone || "+254 700 000 000",
      locationName: locationName || "Nairobi East, Kenya",
      bio: bio || "Verified technician node connected via Kente Cyberpunk gateway.",
      skills: selectedSkills.length > 0 ? selectedSkills : ["Grid Electricity Service"],
      avatar: avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=juma",
      coordinates: coordinates
    });
  };

  const stepsLength = 7;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Step Header */}
      <NeonCard glowColor="gold" className="p-4 bg-zinc-950 border border-white/[0.08] select-none">
        <div className="flex justify-between items-center text-xs font-mono">
          <button 
            onClick={onCancel}
            className="text-cyber-gold hover:text-white uppercase transition cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Cancel Enlistment
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-bold uppercase">Mesh Onboarding Pipeline</span>
            <div className="flex gap-1">
              {Array.from({ length: stepsLength }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx <= step ? "w-6 bg-cyber-gold" : "w-1.5 bg-zinc-800"
                  }`} 
                />
              ))}
            </div>
          </div>
          
          <span className="text-zinc-400 font-mono">STEP 0{step + 1} / 0{stepsLength}</span>
        </div>
      </NeonCard>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="violet" title="Sikiza Jembe // Spoken Protocol" subLabel="Voice ToS">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="py-0.5 px-2 bg-cyber-violet/10 border border-cyber-violet/35 rounded-full text-[9px] font-mono font-bold text-cyber-violet uppercase tracking-widest inline-block select-none">
                    Swahili Oral Handshake
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    Sikiliza Kwanza. A spoken word is sacred.
                  </h3>
                  <p className="font-sans text-xs text-zinc-450 leading-relaxed text-zinc-400">
                    Before uploading telemetry packets, verify your commitment to truth and solidarity in our community mesh. Turn your volume on and hear standard membership requirements.
                  </p>
                </div>

                <div className="p-6 bg-zinc-950 border border-white/[0.04] rounded-2xl flex flex-col items-center justify-center space-y-4 select-none">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayingAgreement(!isPlayingAgreement);
                        if (!isPlayingAgreement && agreementProgress === 100) {
                          setAgreementProgress(0);
                        }
                      }}
                      className="h-16 w-16 bg-cyber-violet hover:bg-cyber-violet/90 rounded-full flex items-center justify-center text-zinc-950 transform hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-cyber-violet/15"
                    >
                      {isPlayingAgreement ? <Pause className="w-6 h-6 shrink-0" /> : <Play className="w-6 h-6 shrink-0 ml-1" />}
                    </button>
                    {isPlayingAgreement && (
                      <span className="absolute -inset-1 rounded-full border border-cyber-violet/30 animate-ping" />
                    )}
                  </div>

                  <div className="w-full max-w-xs space-y-1">
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyber-violet rounded-full transition-all duration-300" 
                        style={{ width: `${agreementProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[9px] text-zinc-650 text-zinc-500">
                      <span>{isPlayingAgreement ? "PLAYING SWAHILI_AUDIO.WAV..." : "VOICE HANDSHAKE"}</span>
                      <span>{Math.floor(agreementProgress / 100 * 90)}s / 90s</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tosChecked}
                    onChange={(e) => setTosChecked(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 bg-zinc-950 border border-white/[0.1] text-cyber-violet focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-sans text-xs font-bold text-[#fafafa] uppercase tracking-wide">
                      I Accept the Spoken Terms (Ninakubali masharti ya sauti)
                    </span>
                    <p className="font-sans text-[11px] text-zinc-500 italic mt-0.5">
                      "Ninajisajili kwa uaminifu, nitafanya kazi kwa uwezo wangu kamili, na kuheshimu mikataba yote."
                    </p>
                  </div>
                </label>
              </div>
            </NeonCard>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                disabled={!tosChecked}
                className="px-6 py-2.5 bg-cyber-gold disabled:opacity-40 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1"
              >
                Endelea // Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Technician Honor Card" subLabel="Picha Yako">
              <div className="space-y-6 text-center">
                <div className="space-y-2 text-left">
                  <span className="py-0.5 px-2 bg-cyber-gold/10 border border-cyber-gold/30 rounded-full text-[9px] font-mono font-bold text-cyber-gold uppercase tracking-widest inline-block select-none">
                    VOUCH COMPLIANT IDENTITY
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    Picha yako, heshima yako.
                  </h3>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    Faces that are recognizable with clear natural light capture build instant localized trust and receive up to 3x higher direct bids inside our mesh.
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4 pb-4">
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-3xl border-2 border-dashed border-zinc-700 overflow-hidden bg-zinc-950/60 flex items-center justify-center p-1 group-hover:border-cyber-gold transition">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview Avatar" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <img src={avatarUrl} alt="Initial Avatar" className="w-full h-full object-cover rounded-2xl" />
                      )}
                    </div>
                    <label className="absolute -bottom-3 -right-3 h-[42px] w-[42px] bg-cyber-gold text-zinc-950 border-4 border-zinc-900 hover:scale-105 active:scale-95 cursor-pointer rounded-2xl flex items-center justify-center shadow-lg transition">
                      <Camera className="w-4 h-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const localPreview = URL.createObjectURL(file);
                            setPhotoPreview(localPreview);
                            setAvatarUrl(localPreview);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-1 select-none">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">SEED TELEMETRY GENERATED AVATAR</p>
                    <div className="flex gap-2">
                      {["juma", "aisha", "boutros", "grace", "kofi"].map((seed) => {
                        const seedAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                        return (
                          <button
                            key={seed}
                            type="button"
                            onClick={() => {
                              setAvatarUrl(seedAvatar);
                              setPhotoPreview("");
                            }}
                            className={`w-9 h-9 rounded-lg border overflow-hidden p-0.5 transition ${
                              avatarUrl === seedAvatar && !photoPreview 
                                ? "border-cyber-gold scale-105 bg-cyber-gold/10" 
                                : "border-white/[0.06] opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={seedAvatar} alt="Alt Seed Avatar" className="w-full h-full object-cover rounded-md" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cyber-gold/5 border border-cyber-gold/15 rounded-2xl text-left flex gap-3 text-xs leading-relaxed select-none">
                  <div className="p-2 bg-cyber-gold/10 text-cyber-gold rounded-xl shrink-0 h-fit">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-zinc-400 font-sans">
                    <strong>Tip:</strong> If you select high quality custom portrait shots, community introducers will automatically review and approve you to Tier-2 status with accelerated payout credentials.
                  </p>
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-cyber-gold text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1"
              >
                Continue Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Select Specialized Portfolios" subLabel="Jua Kali Skills">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-sans font-black text-sm text-cyber-cream uppercase tracking-wide">
                    Select Your Specific Trade Expertise
                  </h3>
                  <p className="font-sans text-xs text-zinc-400">
                    Which specialized Jua Kali categories fit your background? Clients browse our registry by these core networks. Undergo elder audit to extend yours.
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  {CATEGORIES_MAPPING.map((catBlock) => (
                    <div key={catBlock.title} className="space-y-2">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                        {catBlock.title}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        {catBlock.skills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`p-3 rounded-xl border text-left transition relative flex justify-between items-center cursor-pointer ${
                                isSelected 
                                  ? "bg-cyber-gold/10 border-cyber-gold text-cyber-gold text-[11px]" 
                                  : "bg-zinc-950 border-white/[0.05] hover:border-zinc-700 text-zinc-400 text-[11px]"
                              }`}
                            >
                              <span>{skill}</span>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-cyber-gold shrink-0" />
                              ) : (
                                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/[0.04]">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase">SELECTED TELEMETRY PORTFOLIOS</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedSkills.length === 0 ? (
                      <span className="text-zinc-650 text-xs italic text-zinc-500">Pick at least one skill...</span>
                    ) : (
                      selectedSkills.map((sk) => (
                        <span key={sk} className="px-2.5 py-1 bg-zinc-900 border border-cyber-gold/25 rounded-lg text-cyber-gold font-mono text-[9px] font-bold uppercase">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedSkills.length === 0}
                className="px-6 py-2.5 bg-cyber-gold disabled:opacity-40 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1"
              >
                Continue Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Coordinate Node Details" subLabel="Ledger Record">
              <div className="space-y-4 text-left font-sans text-xs">
                <div className="space-y-1">
                  <h3 className="font-sans font-black text-sm text-cyber-cream uppercase tracking-wide">
                    Contact and Primary Neighborhood Coordinates
                  </h3>
                  <p className="text-zinc-400">
                    How can client agents coordinate escrow and map local telemetry pins to dispatch tasks? We do reverse geolocation to establish nearby hubs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[9px] text-zinc-500 uppercase block">Technician Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Juma Kamau"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-cyber-cream focus:outline-hidden text-xs focus:border-cyber-gold/40"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[9px] text-zinc-500 uppercase block">M-Pesa / Phone Node Contact</label>
                    <input 
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-cyber-cream focus:outline-hidden text-xs focus:border-cyber-gold/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-mono relative">
                  <label className="text-[9px] text-zinc-500 uppercase block flex justify-between items-center">
                    <span>Neighborhood Search (Kenya)</span>
                    {geoLoading && <span className="text-cyber-gold animate-pulse text-[8px]">Obtaining GPS Coords...</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Kibera, Nairobi or Kasarani"
                      value={locationName}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-9 pr-14 py-2 text-[#fafafa] focus:outline-hidden text-xs focus:border-cyber-gold/40"
                    />
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-cyber-red" />
                    
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      className="absolute right-2 top-1.5 px-2 py-1 bg-zinc-900 border border-white/[0.06] rounded-lg text-cyber-gold text-[9px] hover:bg-zinc-850 active:scale-95 cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      {geoLoading ? <Loader2 className="w-3 h-3 animate-spin text-cyber-gold" /> : <Crosshair className="w-3 h-3 text-cyber-gold" />}
                      <span>GPS</span>
                    </button>
                  </div>

                  {/* Suggestions Popover block */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-[90] left-0 right-0 mt-1 bg-zinc-950/95 border border-white/[0.1] rounded-xl max-h-48 overflow-y-auto divide-y divide-white/[0.04]"
                      >
                        {suggestions.map((f, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSuggestion(f)}
                            className="w-full px-3 py-2 text-left text-xs bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-cyber-cream flex items-center gap-2"
                          >
                            <MapPin className="w-3.5 h-3.5 text-cyber-gold shrink-0" />
                            <div className="truncate">
                              <span className="font-bold block text-[11px] leading-tight">
                                {f.properties.name || f.properties.street || "Unnamed place"}
                              </span>
                              <span className="text-[9px] text-zinc-500 uppercase leading-none font-sans block">
                                {[f.properties.city || f.properties.state, f.properties.country].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[9px] text-zinc-500 uppercase block">Technician Bio Summary</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide simple bio regarding your service efficiency and tools capability..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-cyber-cream focus:outline-hidden text-xs resize-none focus:border-cyber-gold/40"
                  />
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!fullName || !phone || !locationName}
                className="px-6 py-2.5 bg-cyber-gold text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1 disabled:opacity-40"
              >
                Continue Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Kiapo Cha Twende Kazi // The Sacred Oath" subLabel="Word Covenant">
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <span className="py-0.5 px-2 bg-cyber-gold/10 border border-cyber-gold/30 rounded-full text-[9px] font-mono font-bold text-cyber-gold uppercase tracking-widest inline-block select-none">
                    Baraza Test Covenant
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    Kazi yetu ni heshima mtaani.
                  </h3>
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                    FundiConnect represents our local neighborhood family, not corporate software. To unlock your workbench node, you must pledge our sacred covenants:
                  </p>
                </div>

                {/* Covenant checkpoints */}
                <div className="space-y-3 pt-2 text-left">
                  <label className="flex items-start gap-4 p-4 bg-zinc-950 rounded-2xl border border-white/[0.04] hover:border-cyber-gold/30 cursor-pointer transition-all select-none">
                    <input
                      type="checkbox"
                      checked={oathTruth}
                      onChange={(e) => setOathTruth(e.target.checked)}
                      className="w-5 h-5 rounded mt-0.5 bg-zinc-900 border border-white/[0.1] text-cyber-gold focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-sans text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                        🤝 Word Kept // Ukweli na Uaminifu
                      </span>
                      <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        I pledge to keep my word on every gig. I will never charge hidden broker taxes, abandon a job in progress, or provide sub-standard workmanship.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-zinc-950 rounded-2xl border border-white/[0.04] hover:border-cyber-gold/30 cursor-pointer transition-all select-none">
                    <input
                      type="checkbox"
                      checked={oathApprentice}
                      onChange={(e) => setOathApprentice(e.target.checked)}
                      className="w-5 h-5 rounded mt-0.5 bg-zinc-900 border border-white/[0.1] text-cyber-gold focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-sans text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                        🎓 Sponsoring Apprentices // Malezi ya Kijana
                      </span>
                      <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        I pledge to pass my trade onto a new generation of local wanagenzi / apprentices. I will mentor them with respect and never exploit their honest sweat.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-zinc-950 rounded-2xl border border-white/[0.04] hover:border-cyber-gold/30 cursor-pointer transition-all select-none">
                    <input
                      type="checkbox"
                      checked={oathElder}
                      onChange={(e) => setOathElder(e.target.checked)}
                      className="w-5 h-5 rounded mt-0.5 bg-zinc-900 border border-white/[0.1] text-cyber-gold focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-sans text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                        🛡️ Submission to Baraza // Uamuzi wa Wazee
                      </span>
                      <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        I pledge to submit to our district council of Wazee and elders during neighborhood disputes. I recognize their face-to-face council is final.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Handprint scanner hold button */}
                <div className="flex flex-col items-center justify-center py-6 bg-zinc-950 rounded-3xl border border-white/[0.03] select-none text-center space-y-4">
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] text-[#22c55e] uppercase tracking-widest font-black leading-none">VIBRATIONAL COVENANT ACTIVATION</p>
                    <p className="font-sans text-xs text-zinc-400 pt-1.5">
                      {oathSealed 
                        ? "✓ Kiapo Kimepitishwa. Vow is sealed on the cooperative roster." 
                        : "Verify all three pledges above, then place and hold your finger below to seal the handshake."}
                    </p>
                  </div>

                  <div className="relative flex justify-center items-center h-28 w-28">
                    {/* Ring progress border */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-800" />
                    {oathHoldProgress > 0 && (
                      <div 
                        className="absolute inset-0 rounded-full border-2 border-cyber-gold transition-all duration-75" 
                        style={{
                          borderColor: `rgba(212, 175, 55, ${oathHoldProgress / 100})`,
                          transform: `scale(${1 + (oathHoldProgress / 120)})`,
                          opacity: oathSealed ? 0 : 1
                        }}
                      />
                    )}

                    <button
                      type="button"
                      disabled={!oathTruth || !oathApprentice || !oathElder}
                      onMouseDown={() => (oathTruth && oathApprentice && oathElder) && setIsHoldingOath(true)}
                      onMouseUp={() => setIsHoldingOath(false)}
                      onMouseLeave={() => setIsHoldingOath(false)}
                      onTouchStart={() => (oathTruth && oathApprentice && oathElder) && setIsHoldingOath(true)}
                      onTouchEnd={() => setIsHoldingOath(false)}
                      className={`h-20 w-20 rounded-full flex flex-col items-center justify-center font-sans font-black uppercase text-[9px] tracking-wider transition-all duration-200 select-none ${
                        oathSealed
                          ? "bg-cyber-mint text-zinc-950 shadow-lg shadow-cyber-mint/20 cursor-default"
                          : !oathTruth || !oathApprentice || !oathElder
                            ? "bg-zinc-900 text-zinc-600 opacity-35 cursor-not-allowed"
                            : isHoldingOath
                              ? "bg-cyber-gold text-zinc-950 scale-95 shadow-[0_0_20px_#d4af37]"
                              : "bg-zinc-805 text-cyber-gold border border-cyber-gold/20 hover:bg-zinc-800 cursor-pointer shadow-md hover:scale-[1.02]"
                      }`}
                    >
                      {oathSealed ? (
                        <Check className="w-8 h-8 stroke-[3]" />
                      ) : (
                        <span className="text-center px-1 font-bold">
                          {isHoldingOath ? `${Math.floor(oathHoldProgress)}%` : "HOLD TO VOW"}
                        </span>
                      )}
                    </button>
                  </div>

                  {isHoldingOath && (
                    <p className="font-mono text-[9px] text-cyber-gold animate-pulse uppercase leading-none">Locking fingerprint to village roster...</p>
                  )}
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!oathSealed}
                className="px-6 py-2.5 bg-cyber-gold disabled:opacity-40 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1"
              >
                Continue Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="gold" title="Activation Onboarding Fee" subLabel="Trust Pool Check">
              <div className="space-y-6 text-center">
                <div className="space-y-2 text-left">
                  <span className="py-0.5 px-2 bg-cyber-gold/10 border border-cyber-gold/30 rounded-full text-[9px] font-mono font-bold text-cyber-gold uppercase tracking-widest inline-block select-none">
                    STK Push Security Fee
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    Ada ya kuanza. KES 100 pekee.
                  </h3>
                  <p className="font-sans text-xs text-zinc-405 text-zinc-400 leading-relaxed">
                    We charge a standardized 1-time commitment fee of KES 100 via Safaricom STK push to verify mobile ledger matching and cover GSM/USSD server telemetry maintenance costs.
                  </p>
                </div>

                <div className="w-full max-w-sm mx-auto bg-zinc-950 border border-white/[0.06] rounded-3xl p-8 space-y-6 relative overflow-hidden select-none">
                  {/* Glowing background */}
                  <div className="absolute top-0 right-0 h-20 w-20 bg-cyber-gold/5 blur-2xl" />
                  
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase leading-none">TOTAL ACTIVATION POOL</p>
                    <p className="font-display font-black text-4xl text-white">KES 100</p>
                  </div>

                  <div className="pt-2">
                    {paymentStatus === "idle" && (
                      <button
                        type="button"
                        onClick={triggerMpesa}
                        className="w-full py-3 bg-cyber-gold text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                      >
                        <Smartphone className="w-4 h-4 text-zinc-950" /> PAY KES 100 VIA M-PESA
                      </button>
                    )}

                    {paymentStatus === "waiting" && (
                      <div className="space-y-3 py-2 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyber-gold" />
                        <div className="space-y-1 text-center">
                          <p className="font-mono text-[10px] text-cyber-gold font-bold uppercase animate-pulse leading-none">CHECK SMARTPHONE FOR MPESA PIN RESPONSE</p>
                          <p className="font-mono text-[8px] text-zinc-650 text-zinc-500 uppercase">Awaiting Safaricom STK callback validation...</p>
                        </div>
                      </div>
                    )}

                    {paymentStatus === "confirmed" && (
                      <div className="p-4 bg-cyber-mint/15 border border-cyber-mint/30 text-cyber-mint rounded-2xl flex flex-col items-center space-y-2 animate-in fade-in zoom-in-95">
                        <Check className="w-8 h-8 animate-bounce" />
                        <div className="space-y-0.5">
                          <p className="font-sans font-bold uppercase text-xs">MALIPO YAMEKUBALIWA!</p>
                          <p className="font-mono text-[8px] text-zinc-400">MPESA ID: TXR{Math.floor(Math.random() * 900000)}Y CONFIRMED</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-1.5">
                  <div className="flex items-center gap-1 text-zinc-550 text-zinc-500 font-mono text-[9px] uppercase tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-cyber-gold" /> SECURE INTEGRATED CHIP CHANNEL via safaricom
                  </div>
                  
                  {paymentStatus !== "confirmed" && (
                    <button
                      type="button"
                      onClick={() => setPaymentSkipped(true)}
                      className={`text-zinc-505 text-zinc-500 font-mono text-[10px] hover:text-cyber-gold uppercase underline cursor-pointer transition ${
                        paymentSkipped ? "text-cyber-gold font-bold line-through" : ""
                      }`}
                    >
                      {paymentSkipped ? "✓ Continuing without payment" : "Skip activation payment temporarily"}
                    </button>
                  )}
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={paymentStatus !== "confirmed" && !paymentSkipped}
                className="px-6 py-2.5 bg-cyber-gold disabled:opacity-40 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1"
              >
                Continue Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="step-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <NeonCard glowColor="violet" title="Where Your Commitment Goes" subLabel="Ledger Transparency">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="py-0.5 px-2 bg-cyber-violet/10 border border-cyber-violet/30 rounded-full text-[9px] font-mono font-bold text-cyber-violet uppercase tracking-widest inline-block select-none">
                    Financial Transparency Index
                  </span>
                  <h3 className="font-sans font-black text-xl text-cyber-cream uppercase tracking-tight">
                    100% Non-Profit Community Allocation.
                  </h3>
                  <p className="font-sans text-xs text-zinc-405 text-zinc-400">
                    Our platform executes on fully open books. Here is the strict transparent breakdown of how your KES 100 activation commitment powers our cellular mesh nodes.
                  </p>
                </div>

                <div className="p-6 bg-zinc-950 border border-white/[0.04] rounded-2xl space-y-4 select-none">
                  {[
                    { label: "USSD / SMS GSM Broadcast Credits", amount: 40, desc: "Sponsors your offline cellular status claims." },
                    { label: "Permanent Jua Kali Digital trust ID Card", amount: 30, desc: "We host matching blockchain credentials." },
                    { label: "SkillMesh Infrastructure Servers", amount: 20, desc: "Keeps cloud gateways synchronized." },
                    { label: "Introducer Training Modules", amount: 10, desc: "Assists local elders vuch validation operations." }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-baseline py-1 border-b border-white/[0.03] last:border-b-0 pb-2">
                      <div className="space-y-0.5 min-w-0 pr-4">
                        <h4 className="font-sans font-bold text-xs text-white leading-tight truncate">{item.label}</h4>
                        <p className="font-mono text-[9px] text-zinc-500 truncate">{item.desc}</p>
                      </div>
                      <span className="font-mono text-xs font-black text-cyber-gold shrink-0">KES {item.amount}</span>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-between items-baseline select-none">
                    <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">TOTAL ONBOARDING VALUE</span>
                    <span className="font-display font-black text-lg text-cyber-cream">KES 100</span>
                  </div>
                </div>

                <div className="p-4 bg-cyber-red/5 border border-cyber-red/15 rounded-2xl flex gap-3 text-xs leading-relaxed select-none font-sans">
                  <div className="p-2 bg-cyber-red/10 text-cyber-red rounded-xl shrink-0 h-fit">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-[#ef4444] font-bold uppercase tracking-wider block leading-none">PENDING LEVEL-1 TRUST FLAG</span>
                    <p className="text-zinc-x50 text-zinc-400 leading-relaxed pt-1">
                      Your technician node is initialized as <strong>Trust Level 0</strong>. To trigger visibility and receive client jobs, an authorized Community Introducer (Elder or Pastor) must vouch for your character live using GSM code <code>*555*11#</code>.
                    </p>
                  </div>
                </div>
              </div>
            </NeonCard>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-900 border border-white/[0.08] text-zinc-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleFinalize}
                className="px-8 py-3 bg-cyber-gold text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-transform flex items-center gap-1.5 shadow-lg shadow-cyber-gold/15"
              >
                Launch Technician Profile <Sparkles className="w-4 h-4 text-zinc-950" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
