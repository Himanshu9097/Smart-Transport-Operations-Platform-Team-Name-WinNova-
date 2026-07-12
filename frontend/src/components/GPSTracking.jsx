import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Satellite, Battery, Signal, Zap,
  CheckCircle, Clock, Smartphone, Globe,
  Route, ChevronDown, X, Radio,
  MapPin, Gauge, Activity, Thermometer, User
} from "lucide-react";

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) =>
  (Math.random() * (max - min) + min).toFixed(1);
const MOVEMENT_OPTIONS = ["Moving", "Stationary", "Idle"];
const LOCATION_OPTIONS = [
  { label: "NH-44, Delhi Toll Plaza", lat: "28.7041", lng: "77.1025" },
  { label: "Ring Road, Connaught Place", lat: "28.6330", lng: "77.2195" },
  { label: "Yamuna Expressway, Noida", lat: "28.5355", lng: "77.3910" },
  { label: "GT Karnal Road, Panipat", lat: "29.3909", lng: "76.9635" },
];
const getSignalBars = (strength) => {
  const filled = Math.round((strength / 100) * 5);
  return Array.from({ length: 5 }, (_, i) => i < filled);
};
const getRelativeTime = (date) => {
  const diffSec = Math.floor((Date.now() - date) / 1000);
  if (diffSec < 60) return diffSec + " sec ago";
  return Math.floor(diffSec / 60) + " min ago";
};

export function TrackerStatusBadge({ status, onChange }) {
  const OPTIONS = [
    { value: "online",      label: "Online",      dot: "bg-emerald-500",            text: "text-emerald-700 bg-emerald-100" },
    { value: "maintenance", label: "Maintenance", dot: "bg-amber-500",              text: "text-amber-700 bg-amber-100"   },
    { value: "offline",     label: "Offline",     dot: "bg-red-500 animate-pulse",  text: "text-red-700 bg-red-100"       },
  ];
  const current = OPTIONS.find(o => o.value === status) || OPTIONS[0];
  return (
    <div className="relative group inline-block">
      <select value={status} onChange={e => onChange(e.target.value)}
        className={"appearance-none cursor-pointer pl-6 pr-7 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border-0 focus:outline-none " + current.text}
        style={{ backgroundImage: "none" }}>
        {OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className={"absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full " + current.dot} />
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-60 pointer-events-none" />
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, subValue, color = "text-clay-primary", bgColor = "bg-clay-canvas/60", animate = false }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={bgColor + " rounded-[18px] p-3.5 border border-white/60 shadow-clayCard flex flex-col gap-2"}>
      <div className="flex items-center gap-2">
        <div className={"w-7 h-7 rounded-xl flex items-center justify-center " + color + " bg-white/70 shadow-clayCard flex-shrink-0"}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-muted truncate">{label}</span>
      </div>
      <div>
        <motion.p key={value}
          initial={animate ? { opacity: 0, y: 4 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-headline font-black text-base text-clay-foreground leading-none"
          style={{ fontFamily: "Nunito, sans-serif" }}>
          {value}
        </motion.p>
        {subValue && <p className="font-mono text-[9px] text-clay-muted font-bold mt-0.5">{subValue}</p>}
      </div>
    </motion.div>
  );
}

function SignalStrengthDisplay({ strength }) {
  const bars = getSignalBars(strength);
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((filled, i) => (
        <div key={i}
          className={"w-2 rounded-sm transition-all duration-300 " + (filled ? "bg-clay-primary" : "bg-slate-200")}
          style={{ height: ((i + 1) * 4 + 4) + "px" }} />
      ))}
      <span className="ml-1.5 font-mono text-[9px] font-black text-clay-muted">{strength}%</span>
    </div>
  );
}

function LocationModal({ location, onClose }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-[#332F3A]/50 backdrop-blur-md flex items-center justify-center p-6"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="bg-white rounded-[32px] shadow-claySurface border border-white/60 w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-clay-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-clay-primary" />
              </div>
              <div>
                <h3 className="font-headline font-black text-sm uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Live Map</h3>
                <p className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-wider">{location.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-clay-canvas hover:bg-clay-canvas/80 text-clay-muted hover:text-clay-foreground transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative m-4 rounded-[20px] overflow-hidden" style={{ height: 260 }}>
            <svg width="100%" height="100%" viewBox="0 0 400 260" className="absolute inset-0">
              <rect width="400" height="260" fill="#E8F4FD" rx="20" />
              {[40,80,120,160,200,240,280,320,360].map(x => <line key={"v"+x} x1={x} y1="0" x2={x} y2="260" stroke="#C5D9EC" strokeWidth="1" />)}
              {[30,65,100,130,160,195,225].map(y => <line key={"h"+y} x1="0" y1={y} x2="400" y2={y} stroke="#C5D9EC" strokeWidth="1" />)}
              <line x1="0" y1="130" x2="400" y2="130" stroke="#A3B8CC" strokeWidth="6" />
              <line x1="200" y1="0" x2="200" y2="260" stroke="#A3B8CC" strokeWidth="6" />
              <line x1="0" y1="65" x2="400" y2="195" stroke="#B0C4D5" strokeWidth="4" />
              {[[50,40,110,50],[170,40,90,50],[300,40,80,50],[50,145,110,40],[170,145,90,40],[300,145,80,40],[50,195,110,40],[170,195,90,40],[300,195,80,40]].map(([x,y,w,h],i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#C3D8E8" rx="4" opacity="0.7" />
              ))}
              <rect x="130" y="95" width="55" height="25" fill="#A8D5A2" rx="6" opacity="0.8" />
              <rect x="320" y="95" width="55" height="25" fill="#A8D5A2" rx="6" opacity="0.8" />
              <circle cx="200" cy="130" r="30" fill="rgba(124,58,237,0.08)" />
              <circle cx="200" cy="130" r="18" fill="rgba(124,58,237,0.14)" />
              <circle cx="200" cy="124" r="10" fill="#7C3AED" />
              <circle cx="200" cy="124" r="5" fill="white" />
              <polygon points="200,140 193,126 207,126" fill="#7C3AED" />
            </svg>
            <motion.div
              animate={{ scale: [1,1.6,1], opacity: [0.5,0,0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute"
              style={{ left:"50%", top:"47.5%", width:36, height:36, marginLeft:-18, marginTop:-18, borderRadius:"50%", border:"2px solid #7C3AED", pointerEvents:"none" }} />
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex justify-between items-center shadow-clayCard">
              <div>
                <p className="font-headline font-black text-[11px] text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{location.label}</p>
                <p className="font-mono text-[9px] text-clay-muted font-bold">{location.lat}, {location.lng}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[8px] text-emerald-600 font-extrabold uppercase">Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 pb-6">
            <div className="flex items-center gap-2 font-mono text-[10px] text-clay-muted font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>{location.lat}N, {location.lng}E</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-clay-primary px-3 py-1 bg-clay-primary/10 rounded-full uppercase tracking-wider">GPS Active</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TelemetryGrid({ telemetry, animate }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <MetricCard icon={Gauge}       label="Speed"           value={telemetry.speed + " km/h"}  color="text-clay-primary"                                                           animate={animate} />
      <MetricCard icon={Battery}     label="GPS Battery"     value={telemetry.battery + "%"}    color="text-emerald-600"  subValue={telemetry.battery > 60 ? "Healthy" : "Low"}    animate={animate} />
      <MetricCard icon={Zap}         label="Ignition"        value={telemetry.ignition ? "ON" : "OFF"} color={telemetry.ignition ? "text-emerald-600" : "text-red-500"} bgColor={telemetry.ignition ? "bg-emerald-50/80" : "bg-red-50/60"} animate={animate} />
      <MetricCard icon={Activity}    label="Movement"        value={telemetry.movement}          color={telemetry.movement === "Moving" ? "text-sky-600" : "text-amber-600"} bgColor={telemetry.movement === "Moving" ? "bg-sky-50/80" : "bg-amber-50/60"} animate={animate} />
      <MetricCard icon={Radio}       label="Geofence"        value={telemetry.geofence}          color={telemetry.geofence === "Inside" ? "text-emerald-600" : "text-red-600"} bgColor={telemetry.geofence === "Inside" ? "bg-emerald-50/80" : "bg-red-50/60"} animate={animate} />
      <MetricCard icon={Route}       label="Distance Today"  value={telemetry.distanceToday + " km"} color="text-clay-tertiary"                                                  animate={animate} />
      <MetricCard icon={Thermometer} label="Cargo Temp"      value={telemetry.cargoTemp + "°C"} color="text-cyan-600"    bgColor="bg-cyan-50/60" subValue="Refrigerated"         animate={animate} />
      <MetricCard icon={User}        label="Assigned Driver" value={telemetry.driver}            color="text-violet-600" bgColor="bg-violet-50/60"                               animate={animate} />
    </div>
  );
}

export default function GPSCard() {
  const [trackerStatus, setTrackerStatus] = useState("online");
  const [showMap, setShowMap] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now() - 8000);
  const [locationIdx, setLocationIdx] = useState(0);
  const [animateTelemetry, setAnimateTelemetry] = useState(false);
  const [telemetry, setTelemetry] = useState({
    speed: 68, signal: 84, battery: 92, ignition: true,
    movement: "Moving", geofence: "Inside", distanceToday: 184,
    driver: "Rajesh Kumar", cargoTemp: 6.4,
  });

  const mockDevice = { id: "GPS-TRK-784512", sim: "+91 98765 43210", network: "Airtel 5G" };
  const currentLocation = LOCATION_OPTIONS[locationIdx];

  const randomiseTelemetry = useCallback(() => {
    setAnimateTelemetry(true);
    setTelemetry(prev => ({
      ...prev,
      speed: randomBetween(0, 95),
      signal: randomBetween(45, 100),
      battery: randomBetween(60, 100),
      movement: MOVEMENT_OPTIONS[randomBetween(0, 2)],
      cargoTemp: parseFloat(randomFloat(5, 12)),
      distanceToday: prev.distanceToday + randomBetween(0, 3),
    }));
    setLastSyncTime(Date.now());
    setLocationIdx(i => (i + 1) % LOCATION_OPTIONS.length);
    setTimeout(() => setAnimateTelemetry(false), 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(randomiseTelemetry, 5000);
    return () => clearInterval(interval);
  }, [randomiseTelemetry]);

  const [relTime, setRelTime] = useState(getRelativeTime(lastSyncTime));
  useEffect(() => {
    const t = setInterval(() => setRelTime(getRelativeTime(lastSyncTime)), 1000);
    return () => clearInterval(t);
  }, [lastSyncTime]);

  const syncDate = new Date(lastSyncTime).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      {showMap && <LocationModal location={currentLocation} onClose={() => setShowMap(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="border-t border-slate-100 pt-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-clay-primary to-violet-600 flex items-center justify-center shadow-clayButton flex-shrink-0">
              <Satellite className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-headline font-black text-xs uppercase tracking-wider text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
              GPS &amp; Live Tracking
            </span>
          </div>
          <TrackerStatusBadge status={trackerStatus} onChange={setTrackerStatus} />
        </div>

        {/* Device Info */}
        <div className="bg-clay-canvas/40 rounded-[20px] border border-white/60 shadow-clayCard p-4 space-y-2.5">
          <p className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-primary mb-2">Device Information</p>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-clay-muted flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5 text-clay-primary/60" />GPS Device ID</span>
            <span className="font-mono text-clay-foreground">{mockDevice.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-clay-muted flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-clay-primary/60" />SIM Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-clay-foreground">{mockDevice.sim}</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />{mockDevice.network}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-clay-muted flex items-center gap-1.5"><Signal className="w-3.5 h-3.5 text-clay-primary/60" />Signal Strength</span>
            <SignalStrengthDisplay strength={telemetry.signal} />
          </div>
        </div>

        {/* Location */}
        <div className="bg-clay-canvas/40 rounded-[20px] border border-white/60 shadow-clayCard p-4 space-y-3">
          <p className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-primary mb-1">Current Location</p>
          <div className="flex justify-between items-start gap-3">
            <div>
              <motion.p key={currentLocation.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                className="text-xs font-black text-clay-foreground flex items-center gap-1.5" style={{ fontFamily: "Nunito, sans-serif" }}>
                <MapPin className="w-3.5 h-3.5 text-clay-primary flex-shrink-0" />{currentLocation.label}
              </motion.p>
              <p className="font-mono text-[9px] text-clay-muted font-bold mt-0.5 ml-5">{currentLocation.lat}, {currentLocation.lng}</p>
            </div>
            <button onClick={() => setShowMap(true)}
              className="flex items-center gap-1.5 bg-gradient-to-br from-clay-primary to-violet-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-[12px] shadow-clayButton hover:shadow-[8px_8px_16px_rgba(124,58,237,0.35)] active:scale-95 transition-all cursor-pointer flex-shrink-0"
              style={{ fontFamily: "Nunito, sans-serif" }}>
              <Globe className="w-3 h-3" />Live Map
            </button>
          </div>
        </div>

        {/* Last Sync */}
        <div className="bg-clay-canvas/40 rounded-[20px] border border-white/60 shadow-clayCard p-4">
          <p className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-primary mb-2">Last Synchronization</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-clay-muted" />
              <motion.span key={syncDate} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-clay-foreground font-bold">{syncDate}
              </motion.span>
            </div>
            <motion.div key={relTime} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100">
              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
              <span className="font-mono text-[8px] text-emerald-700 font-extrabold uppercase tracking-wider">Synced {relTime}</span>
            </motion.div>
          </div>
        </div>

        {/* Telemetry */}
        <div className="space-y-2">
          <p className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-primary">Live Telemetry</p>
          <TelemetryGrid telemetry={telemetry} animate={animateTelemetry} />
        </div>

        {/* Auto-update indicator */}
        <div className="flex items-center justify-end gap-1.5">
          <motion.div animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[8px] text-clay-muted font-bold uppercase tracking-wider">Auto-updates every 5 sec</span>
        </div>

      </motion.div>
    </>
  );
}
