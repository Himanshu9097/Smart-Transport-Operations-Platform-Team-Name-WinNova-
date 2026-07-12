import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Plus, Search, Truck, Users, Calendar, 
  Settings, LayoutGrid, Wrench, Shield, Check, Info, AlertTriangle
} from 'lucide-react';

export default function Console() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // State for mock vehicles
  const [vehicles, setVehicles] = useState([
    { id: 1, reg: 'DL-3C-SG-1024', name: 'Volvo Heavy Hauler', type: 'Trailer', capacity: '20 Tons', odometer: '42,300 KM', status: 'available' },
    { id: 2, reg: 'MH-12-PQ-4560', name: 'Tata Ultra Delivery', type: 'Truck', capacity: '10 Tons', odometer: '18,500 KM', status: 'on_trip' },
    { id: 3, reg: 'KA-03-MR-9801', name: 'Mahindra Loadking', type: 'LJV', capacity: '3.5 Tons', odometer: '64,900 KM', status: 'in_shop' },
    { id: 4, reg: 'HR-26-AN-3312', name: 'BharatBenz 2823C', type: 'Tipper', capacity: '16 Tons', odometer: '29,400 KM', status: 'available' },
    { id: 5, reg: 'GJ-01-XX-7789', name: 'Eicher Pro 2049', type: 'LJV', capacity: '2.8 Tons', odometer: '12,100 KM', status: 'on_trip' }
  ]);
  
  // State for adding a new vehicle
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Truck');
  const [newCapacity, setNewCapacity] = useState('10 Tons');
  const [newOdometer, setNewOdometer] = useState('0 KM');

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newReg || !newName) return;
    
    const newVeh = {
      id: Date.now(),
      reg: newReg,
      name: newName,
      type: newType,
      capacity: newCapacity,
      odometer: newOdometer,
      status: 'available'
    };
    
    setVehicles(prev => [...prev, newVeh]);
    setShowAddModal(false);
    setNewReg('');
    setNewName('');
    setNewType('Truck');
    setNewCapacity('10 Tons');
    setNewOdometer('0 KM');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || v.status === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-clay-canvas text-clay-foreground select-none relative flex font-body overflow-hidden">
      
      {/* High-Fidelity Animated 3D Blobs in background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl bg-clay-primary/10 -top-[10%] -left-[10%] clay-blob-anim-1"></div>
        <div className="absolute h-[50vh] w-[50vh] rounded-full blur-3xl bg-clay-secondary/10 -right-[5%] top-[15%] clay-blob-anim-2"></div>
        <div className="absolute h-[55vh] w-[55vh] rounded-full blur-3xl bg-clay-tertiary/10 -bottom-[15%] left-[25%] clay-blob-anim-3"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white/60 backdrop-blur-xl border-r-2 border-white/80 p-8 flex flex-col justify-between hidden md:flex relative z-10">
        <div className="space-y-12">
          {/* Logo container */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-clayButton">
              <span className="material-symbols-outlined font-black text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>TransitOps</span>
          </div>

          {/* Nav list */}
          <nav className="flex flex-col gap-3">
            {[
              { id: 'overview', icon: LayoutGrid, label: 'Overview' },
              { id: 'vehicles', icon: Truck, label: 'Vehicles Registry' },
              { id: 'drivers', icon: Users, label: 'Driver Crew' },
              { id: 'schedule', icon: Calendar, label: 'Dispatch Log' },
              { id: 'settings', icon: Settings, label: 'Control Settings' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[20px] font-bold text-sm tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-white to-[#F0EBF7] text-clay-primary shadow-clayCard translate-x-1.5' 
                      : 'text-clay-muted hover:text-clay-primary hover:bg-white/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-clay-primary' : 'text-clay-muted'}`} />
                  <span style={{ fontFamily: "Nunito, sans-serif" }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-6">
          <div className="p-4 bg-white/80 rounded-[24px] border border-white/60 shadow-clayCard flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-clay-primary/20 flex items-center justify-center font-bold text-clay-primary text-sm">
              {user ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-black text-sm truncate uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{user ? user.name : 'Console User'}</div>
              <div className="text-[10px] text-clay-muted font-bold uppercase truncate tracking-wider">{user ? user.role.replace('_', ' ') : 'Manager'}</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-white text-clay-muted hover:text-error hover:bg-red-50 px-6 py-4 rounded-[20px] border-2 border-transparent hover:border-red-100 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.95]"
          >
            <LogOut className="w-4 h-4" />
            <span style={{ fontFamily: "Nunito, sans-serif" }}>System Signout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Mobile Header Bar */}
        <header className="flex justify-between items-center mb-10 md:hidden bg-white/60 backdrop-blur-xl border border-white/60 p-4 rounded-[24px] shadow-clayCard">
          <div className="flex items-center gap-2">
            <div className="bg-clay-primary text-white p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">local_shipping</span>
            </div>
            <span className="font-black text-lg tracking-tight uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>TransitOps</span>
          </div>
          <button onClick={handleLogout} className="text-clay-muted hover:text-error p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Dashboard Title & Greetings */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "Nunito, sans-serif" }}>
              {activeMenu === 'overview' && 'Operations Dashboard'}
              {activeMenu === 'vehicles' && 'Vehicles Registry'}
              {activeMenu === 'drivers' && 'Driver Crew'}
              {activeMenu === 'schedule' && 'Dispatch Log'}
              {activeMenu === 'settings' && 'Platform Control'}
            </h1>
            <p className="text-clay-muted font-medium text-sm md:text-base mt-1">
              Welcome back, {user ? user.name : 'Operator'}. Platform checks are normal.
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-white/80 backdrop-blur-xl border border-white px-4 py-2 rounded-full shadow-clayCard text-xs font-bold font-mono tracking-wide text-clay-primary flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>ROLE: {user ? user.role.toUpperCase().replace('_', ' ') : 'FLEET_MANAGER'}</span>
            </div>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeMenu === 'overview' && (
          <div className="space-y-10">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Total Registered Fleet', val: '248', desc: 'Vehicles on track', color: 'from-[#A78BFA] to-[#7C3AED]' },
                { title: 'Active Transit Missions', val: '142', desc: 'Real-time shipments', color: 'from-pink-400 to-pink-500' },
                { title: 'Available Driver Crew', val: '86', desc: 'Ready for dispatch', color: 'from-sky-400 to-sky-500' },
                { title: 'Pending Maintenance', val: '3', desc: 'Urgent workshop logs', color: 'from-amber-400 to-amber-500', alert: true }
              ].map((kpi, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-[32px] p-6 shadow-clayCard border border-white/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-48 group cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-clay-muted font-bold uppercase tracking-wider max-w-[140px]">
                      {kpi.title}
                    </span>
                    {kpi.alert && (
                      <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black tracking-tight" style={{ fontFamily: "Nunito, sans-serif" }}>{kpi.val}</h3>
                    <p className="text-[11px] text-clay-muted font-bold uppercase mt-1 tracking-wide">{kpi.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Analytics Composition Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Analytics summary (bulging clay card) */}
              <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60 lg:col-span-8 space-y-6">
                <h3 className="font-headline text-2xl font-black uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>Fleet Utilization Trend</h3>
                <div className="aspect-video bg-clay-canvas/40 rounded-[24px] border-2 border-dashed border-white/90 flex flex-col items-center justify-center p-6 text-center shadow-clayPressed">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-clay-primary mb-4 shadow-clayCard">
                    <span className="material-symbols-outlined text-3xl font-black">monitoring</span>
                  </div>
                  <h4 className="font-bold text-sm uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>No Active Telemetry Connection</h4>
                  <p className="text-xs text-clay-muted mt-1 max-w-xs">Connect diagnostic equipment or third-party ELDs to load live operational graphs.</p>
                </div>
              </div>

              {/* Right Panel: Operations notifications feed (recessed clay panel) */}
              <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 shadow-clayCard border border-white/60 lg:col-span-4 space-y-6 flex flex-col">
                <h3 className="font-headline text-2xl font-black uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>Security Logs</h3>
                <div className="flex-1 space-y-4">
                  {[
                    { type: 'info', icon: Info, text: 'Driver Rahul registered successfully.', time: '10m ago' },
                    { type: 'warning', icon: AlertTriangle, text: 'Vehicle TR-104 requires service.', time: '1h ago' },
                    { type: 'success', icon: Check, text: 'Trip DL-3C completed safely.', time: '2h ago' }
                  ].map((log, i) => {
                    const LogIcon = log.icon;
                    return (
                      <div key={i} className="flex gap-3 items-start p-3 bg-white/90 rounded-[20px] shadow-clayCard border border-white/80">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          log.type === 'success' ? 'bg-clay-success/15 text-clay-success' :
                          log.type === 'warning' ? 'bg-clay-warning/15 text-clay-warning' : 'bg-clay-tertiary/15 text-clay-tertiary'
                        }`}>
                          <LogIcon className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-clay-foreground leading-normal">{log.text}</p>
                          <span className="font-mono text-[9px] font-bold text-clay-muted uppercase tracking-wider">{log.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Registry Tab Content */}
        {activeMenu === 'vehicles' && (
          <div className="space-y-8">
            
            {/* Action Bar (Search and Add Vehicle) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 p-4 rounded-[24px] border border-white/40 shadow-clayCard">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search registration or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-5 py-3.5 pr-12 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs placeholder-clay-muted"
                />
                <Search className="absolute right-4 top-3.5 w-4 h-4 text-clay-muted" />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-white/60 text-clay-muted font-bold text-xs px-4 py-3.5 rounded-[20px] shadow-clayCard focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="in_shop">In Workshop</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none uppercase tracking-wider"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Plus className="w-4 h-4 font-black" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>

            {/* Vehicles Table/Grid (bulging clay cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(veh => (
                <div 
                  key={veh.id} 
                  className="bg-white rounded-[32px] p-6 shadow-clayCard border border-white/60 flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-headline font-black text-xl tracking-tight text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                        {veh.name}
                      </h4>
                      <span className="font-mono text-[10px] text-clay-muted font-bold uppercase tracking-widest mt-1 block">
                        {veh.reg}
                      </span>
                    </div>
                    
                    <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      veh.status === 'available' ? 'bg-clay-success/15 text-clay-success' :
                      veh.status === 'on_trip' ? 'bg-clay-tertiary/15 text-clay-tertiary' : 'bg-clay-secondary/15 text-clay-secondary'
                    }`}>
                      {veh.status === 'available' && 'Available'}
                      {veh.status === 'on_trip' && 'On Trip'}
                      {veh.status === 'in_shop' && 'In Shop'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Classification</span>
                      <p className="font-bold text-xs text-clay-foreground mt-0.5">{veh.type}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Capacity</span>
                      <p className="font-bold text-xs text-clay-foreground mt-0.5">{veh.capacity}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Odometer Records</span>
                      <p className="font-bold text-xs text-clay-foreground mt-0.5">{veh.odometer}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredVehicles.length === 0 && (
                <div className="col-span-full bg-white/40 p-12 text-center rounded-[32px] border-2 border-dashed border-white/80 shadow-clayCard">
                  <Truck className="w-12 h-12 text-clay-muted mx-auto mb-4" />
                  <h4 className="font-bold text-sm uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>No vehicles matched</h4>
                  <p className="text-xs text-clay-muted mt-1">Try tweaking your filters or search keywords.</p>
                </div>
              )}
            </div>
            
          </div>
        )}

        {/* Mocking other tabs */}
        {(activeMenu === 'drivers' || activeMenu === 'schedule' || activeMenu === 'settings') && (
          <div className="bg-white rounded-[32px] p-12 border border-white/60 shadow-clayCard text-center space-y-4">
            <div className="w-16 h-16 bg-clay-primary/10 rounded-full flex items-center justify-center text-clay-primary mx-auto shadow-clayCard">
              <span className="material-symbols-outlined text-3xl font-black">engineering</span>
            </div>
            <h3 className="font-headline text-2xl font-black uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>
              Module Under Construction
            </h3>
            <p className="text-xs text-clay-muted max-w-sm mx-auto leading-relaxed font-medium">
              We are actively developing this sub-module of the ERP system to connect securely to your MongoDB databases.
            </p>
          </div>
        )}

      </main>
      
      {/* Add Vehicle Modal Panel (Claymorphic recessed style) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>New Registry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider">Close</button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-5">
              {/* Reg number */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-3C-SG-1024"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-3 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              {/* Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle Model/Name</label>
                <input
                  type="text"
                  placeholder="e.g. Volvo FH16 Heavy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-3 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              {/* Type & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-3 rounded-[20px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Trailer">Trailer</option>
                    <option value="LJV">LJV (Light)</option>
                    <option value="Tipper">Tipper</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Payload Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Tons"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-3 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Odometer */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Odometer Reading</label>
                <input
                  type="text"
                  placeholder="e.g. 10,000 KM"
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-3 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-4 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Register Vehicle
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
