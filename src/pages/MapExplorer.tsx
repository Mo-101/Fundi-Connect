import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, 
  Navigation, 
  Compass, 
  Phone,
  MessageCircle,
  X as XIcon
} from 'lucide-react';
import { api } from '../lib/api';
import { WorkerProfile, User } from '../types';

import { PageContainer } from '../components/standard/AppShell';
import { LoadingState } from '../components/standard/StateComponents';

const RUIRU_CENTER = { lat: -1.1481, lng: 36.9580 };
const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
    }
  ]
};

type MeshMapProps = {
  mapsApiKey: string;
};

function MeshMap({ mapsApiKey }: MeshMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
    libraries: LIBRARIES
  });

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
  }

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [workers, setWorkers] = useState<(User & WorkerProfile)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const navigate = useNavigate();

  const getPhoneHref = (phone?: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits ? `tel:+${digits}` : null;
  };

  const getWhatsAppHref = (phone?: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : null;
  };

  const onLoad = useCallback(function callback(m: google.maps.Map) {
    setMap(m);
  }, []);

  const onUnmount = useCallback(function callback(m: google.maps.Map) {
    setMap(null);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const workerProfiles = await api.getWorkers();
        setWorkers(workerProfiles as any);
      } catch (err) {
        console.error("Map data fetch error:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map?.panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          map?.setZoom(15);
        },
        () => alert("Location access denied.")
      );
    }
  };

  if (loadError) return (
    <PageContainer className="p-0">
      <div className="h-full flex flex-col items-center justify-center bg-stone-50 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center">
          <XIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black serif text-stone-900">Map unavailable.</h2>
        <div className="space-y-2">
          <p className="text-stone-500 serif italic max-w-sm">
            Check if "Maps JavaScript API" is enabled in your Google Cloud Console.
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
            Error Code: {loadError.name || 'ApiTargetBlockedMapError'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/smartphone/dashboard')}
          className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
        >
          Return to Dashboard
        </button>
      </div>
    </PageContainer>
  );

  if (!isLoaded) return (
    <PageContainer className="p-0">
      <div className="h-full flex items-center justify-center bg-stone-50">
        <LoadingState message="Connecting to Google Satellite Mesh..." />
      </div>
    </PageContainer>
  );

  return (
    <PageContainer className="p-0 sm:p-0 md:p-0">
      <div className="relative h-[calc(100vh-80px)] md:h-[80vh] w-full overflow-hidden md:rounded-[48px] md:m-4 md:w-[calc(100%-32px)] bg-stone-100">
        
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={RUIRU_CENTER}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {workers.map(worker => (
            <Marker
              key={worker.userId}
              position={{ lat: Number(worker.lat) || RUIRU_CENTER.lat, lng: Number(worker.lng) || RUIRU_CENTER.lng }}
              onClick={() => setSelectedPin({ ...worker, type: 'fundi' })}
              icon={{
                url: worker.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.userId}`,
                scaledSize: new google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>

        {/* Floating Search Placeholder */}
        <div className="absolute top-6 left-6 right-6 z-10">
          <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-[28px] flex items-center px-6 gap-4 border border-stone-100">
            <Search className="w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Mesh Map..." 
              className="bg-transparent border-none outline-none w-full py-4 font-black serif italic"
            />
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-28 right-6 z-10 flex flex-col gap-3">
           <button onClick={moveToCurrentLocation} className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-stone-600 active:scale-90 transition-all">
             <Navigation className="w-5 h-5" />
           </button>
           <button onClick={() => map?.setHeading(0)} className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-stone-600 active:scale-90 transition-all">
             <Compass className="w-5 h-5" />
           </button>
        </div>

        {/* Mesh Status */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-stone-900/90 backdrop-blur-md px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
            <span className="text-brand-gold">{isLoadingData ? 'Loading Fundis' : `${workers.length} Registered Fundi${workers.length === 1 ? '' : 's'}`}</span>
          </div>
        </div>

        {/* Info Card */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-8 z-30 shadow-[0_-20px_80px_rgba(0,0,0,0.15)]"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="flex gap-4">
                    <div className="w-16 h-16 bg-brand-cream rounded-2xl overflow-hidden border border-stone-100 shrink-0">
                      <img src={selectedPin.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPin.userId}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black serif text-stone-900 leading-tight">{selectedPin.name || selectedPin.skillNeeded}</h3>
                      <p className="text-brand-indigo font-black text-[10px] uppercase tracking-widest mt-1">
                        {selectedPin.type === 'fundi' ? selectedPin.skills?.join(', ') : 'Market Need'}
                      </p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedPin(null)} className="p-2 hover:bg-stone-50 rounded-full">
                    <XIcon className="w-6 h-6 text-stone-300" />
                 </button>
              </div>
              <button 
                onClick={() => {
                   navigate(`/smartphone/category/${encodeURIComponent(selectedPin.skills?.[0] || 'All')}`);
                }}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
              >
                View Details
              </button>
              {selectedPin.type === 'fundi' && selectedPin.phone && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href={getPhoneHref(selectedPin.phone) || undefined}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-indigo py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <a
                    href={getWhatsAppHref(selectedPin.phone) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-gold py-4 text-[10px] font-black uppercase tracking-widest text-brand-indigo shadow-lg active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

export default function MapExplorer() {
  const [mapsApiKey, setMapsApiKey] = useState<string | null>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null
  );
  const [configLoaded, setConfigLoaded] = useState(Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY));
  const navigate = useNavigate();

  useEffect(() => {
    if (mapsApiKey) return;

    const loadMapConfig = async () => {
      try {
        const res = await fetch('/api/config/maps');
        const data = await res.json();
        setMapsApiKey(data.apiKey || null);
      } catch (err) {
        console.error("Map config fetch error:", err);
      } finally {
        setConfigLoaded(true);
      }
    };

    loadMapConfig();
  }, [mapsApiKey]);

  if (!configLoaded) {
    return (
      <PageContainer className="p-0">
        <div className="h-full flex items-center justify-center bg-stone-50">
          <LoadingState message="Loading main map key..." />
        </div>
      </PageContainer>
    );
  }

  if (!mapsApiKey) {
    return (
      <PageContainer className="p-0">
        <div className="h-full flex flex-col items-center justify-center bg-stone-50 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center">
            <XIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black serif text-stone-900">Map key missing.</h2>
          <p className="text-stone-500 serif italic max-w-sm">
            Add GOOGLE_MAPS_API_KEY to .env and restart the local server.
          </p>
          <button
            onClick={() => navigate('/smartphone/dashboard')}
            className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </PageContainer>
    );
  }

  return <MeshMap mapsApiKey={mapsApiKey} />;
}
