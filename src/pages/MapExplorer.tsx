import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  Search, 
  Navigation, 
  Compass, 
  Star,
  Briefcase,
  X as XIcon
} from 'lucide-react';
import { api } from '../lib/api';
import { Job, WorkerProfile, User } from '../types';

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

export default function MapExplorer() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  });

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
  }

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<'fundis' | 'jobs'>('fundis');
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [workers, setWorkers] = useState<(User & WorkerProfile)[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const navigate = useNavigate();

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

        const allJobs = await api.getJobs();
        setJobs(allJobs.filter(j => j.status === 'open'));
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
          {activeLayer === 'fundis' ? (
            workers.map(worker => (
              <Marker
                key={worker.userId}
                position={{ lat: Number(worker.lat) || RUIRU_CENTER.lat, lng: Number(worker.lng) || RUIRU_CENTER.lng }}
                onClick={() => setSelectedPin({ ...worker, type: 'fundi' })}
                icon={{
                  url: worker.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.userId}`,
                  scaledSize: new google.maps.Size(40, 40),
                }}
              />
            ))
          ) : (
            jobs.map(job => (
              <Marker
                key={job.id}
                position={{ lat: Number(job.lat) || RUIRU_CENTER.lat - 0.01, lng: Number(job.lng) || RUIRU_CENTER.lng + 0.01 }}
                onClick={() => setSelectedPin({ ...job, type: 'job' })}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#BF102E',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  scale: 8,
                }}
              />
            ))
          )}
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

        {/* Layer Switcher */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-stone-900/90 backdrop-blur-md px-6 py-3 rounded-full flex gap-6 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
            <button onClick={() => setActiveLayer('fundis')} className={`transition-all ${activeLayer === 'fundis' ? 'text-brand-gold scale-110 underline decoration-2 underline-offset-4' : 'opacity-40'}`}>Nearby Fundis</button>
            <div className="w-px h-4 bg-white/20" />
            <button onClick={() => setActiveLayer('jobs')} className={`transition-all ${activeLayer === 'jobs' ? 'text-brand-red scale-110 underline decoration-2 underline-offset-4' : 'opacity-40'}`}>Market Jobs</button>
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
                   if(selectedPin.type === 'fundi') navigate(`/smartphone/category/${encodeURIComponent(selectedPin.skills?.[0])}`);
                   else navigate(`/smartphone/jobs?id=${selectedPin.id}`);
                }}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
              >
                View Details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

