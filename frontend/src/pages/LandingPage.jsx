import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, Database, Send, ChevronDown, CheckCircle2, XCircle, 
  ArrowRight, ShieldAlert, BadgeInfo, Check, HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const [dbStatus, setDbStatus] = useState({ loading: true, active: false, message: '' });
  const [dashboardTab, setDashboardTab] = useState('dashboard');
  const [copilotInput, setCopilotInput] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: 'copilot',
      text: 'There are currently 4 vehicles exceeding their speed limits. Fleet-A22, Fleet-B09, and two in the East Region. Would you like me to send alerts to their supervisors?'
    }
  ]);

  // Loader sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      // Trigger initial hero animations
      setTimeout(() => {
        const heroReveals = document.querySelectorAll('section:first-of-type .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
      }, 100);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Fetch backend DB status on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setDbStatus({
          loading: false,
          active: data.dbState === 'Connected',
          message: data.message
        });
      })
      .catch(err => {
        setDbStatus({
          loading: false,
          active: false,
          message: 'Server offline'
        });
      });
  }, []);

  // Intersection Observer for Scroll animations
  useEffect(() => {
    if (pageLoading) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => revealObserver.observe(el));

    return () => {
      reveals.forEach(el => revealObserver.unobserve(el));
    };
  }, [pageLoading]);

  const handleSendCopilot = () => {
    if (!copilotInput.trim()) return;
    
    const userMsg = { sender: 'user', text: copilotInput };
    setCopilotMessages(prev => [...prev, userMsg]);
    
    const query = copilotInput.toLowerCase();
    setCopilotInput('');

    setTimeout(() => {
      let reply = 'Analyzing operational logs... Everything appears stable.';
      if (query.includes('speed') || query.includes('limit')) {
        reply = 'Fleet-A22 has slowed down to 68 KM/H. The remaining 3 vehicles are still above threshold. Alerts have been sent to dispatch.';
      } else if (query.includes('driver') || query.includes('available')) {
        reply = 'Drivers Rahul Sharma and Preeti Patel are currently on duty and available for immediate dispatch.';
      } else if (query.includes('maintenance') || query.includes('predict')) {
        reply = 'Vehicle TR-104 has an elevated warning flag. Scheduled maintenance check is recommended in the next 48 hours.';
      } else if (query.includes('fuel')) {
        reply = 'Average fuel consumption across active trips is 5.8 KM/L, which is within the optimal 92% efficiency range.';
      }
      setCopilotMessages(prev => [...prev, { sender: 'copilot', text: reply }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body select-none">
      
      {/* Page Entry Loader with driving/bouncing truck animation */}
      {pageLoading && (
        <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center justify-center space-y-4">
            {/* Driving/Bouncing Truck */}
            <div className="truck-loader-anim text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            {/* Scrolling Road Line */}
            <div className="road-line w-24 h-1.5 border border-border mt-1"></div>
            <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant font-black animate-pulse pt-2">
              Initializing TransitOps...
            </span>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden" id="hero">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Left Text (animated with reveal) */}
          <div className="relative z-10 reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-border mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-mono text-xs uppercase font-bold">Now with AI Copilot v2.0</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-6xl font-black mb-6 max-w-xl tracking-tight leading-tight">
              Reinvent Fleet Management with <span className="text-primary underline decoration-warning decoration-4 underline-offset-4">Intelligent</span> Transport Operations
            </h1>
            
            <p className="text-body text-base md:text-lg text-on-surface-variant mb-10 max-w-lg font-medium">
              The unified operating system for modern fleets. Automate scheduling, optimize fuel consumption, and empower drivers with real-time AI insights.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/login" className="candy-button bg-primary text-white px-8 py-4 rounded font-mono text-sm font-bold hard-shadow flex items-center gap-2">
                Launch Dashboard
                <span className="material-symbols-outlined font-black">arrow_forward</span>
              </Link>
              <button className="bg-white border-2 border-border text-on-surface px-8 py-4 rounded font-mono text-sm font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
            
            <div className="flex items-center gap-8 opacity-60 hover:opacity-100 transition-all font-mono font-bold text-xs">
              <span className="border-b-2 border-secondary">ISO 27001</span>
              <span className="border-b-2 border-warning">GDPR COMPLIANT</span>
              <span className="border-b-2 border-success">SOC 2 TYPE II</span>
            </div>
          </div>

          {/* Hero Right Dashboard Preview (animated with reveal) */}
          <div className="relative reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full"></div>
            <div className="relative sticker-card bg-white rounded-xl p-4 hard-shadow-primary overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b-2 border-border pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div className="font-mono text-xs text-on-surface-variant font-bold">fleet_ops_live_v2.json</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-surface-container rounded border-2 border-border">
                  <div className="font-mono text-[10px] opacity-70 mb-1 font-bold">Fleet Health</div>
                  <div className="text-xl font-black text-success">98.2%</div>
                </div>
                <div className="p-4 bg-surface-container rounded border-2 border-border">
                  <div className="font-mono text-[10px] opacity-70 mb-1 font-bold">Active Trips</div>
                  <div className="text-xl font-black">142</div>
                </div>
                <div className="p-4 bg-surface-container rounded border-2 border-border">
                  <div className="font-mono text-[10px] opacity-70 mb-1 font-bold">Maint. Alerts</div>
                  <div className="text-xl font-black text-error">3</div>
                </div>
              </div>
              
              <div className="relative aspect-video rounded border-2 border-border overflow-hidden mb-4 bg-slate-900">
                <div className="w-full h-full bg-cover bg-center opacity-90" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD63FJwaB0TT48P9GC9Z2rKd0jPGJBDxbEF6AjV6VtvW2ko_LhbCtuDSGS5gcm4_viPzTab1ssrejrjgjPWqUz-q_J_uNSGrp_8E_7lDit6MkWmpTTOj3arBXGO1xZAxnpynOxpzaf8AhhsfjimZmUhjjj84XubFGEPDdAxAKKabvSI_JGZJa4U-OILqkjaFXAIlOt6_F0cvBhSG16ZHQ8ntxLzbLGXtYQrdQmwFqWLpo0zZv1DFlIX')" }}></div>
                
                {/* Floating Copilot Window */}
                <div className="absolute bottom-4 right-4 w-60 glass-panel p-4 rounded-lg border-2 border-border shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm font-black" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="font-mono text-[10px] font-black">AI Copilot</span>
                  </div>
                  <p className="text-[10px] text-on-surface font-semibold leading-relaxed">
                    "Recommended rerouting for Fleet-04 to avoid heavy congestion on Highway 101."
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button className="text-[9px] bg-primary text-white px-2 py-1 rounded font-bold border border-border">Apply</button>
                    <button className="text-[9px] bg-slate-200 px-2 py-1 rounded font-bold border border-border">Dismiss</button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-surface-container rounded border-2 border-border flex items-center justify-center">
                  <div className="w-full px-4">
                    <div className="h-2.5 w-full bg-slate-200 border border-border overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[10px] font-bold">
                      <span>Fuel Efficiency</span>
                      <span>75%</span>
                    </div>
                  </div>
                </div>
                <div className="h-24 bg-surface-container rounded border-2 border-border p-3 flex flex-col justify-between">
                  <div className="h-2 bg-slate-200 border border-slate-300 w-3/4"></div>
                  <div className="h-2 bg-slate-200 border border-slate-300 w-1/2"></div>
                  <div className="h-2 bg-slate-200 border border-slate-300 w-2/3"></div>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. Trusted By Marquee (animated with reveal) */}
      <section className="py-10 border-y-2 border-border bg-white overflow-hidden reveal">
        <div className="marquee">
          <div className="marquee-content flex items-center justify-around">
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-primary">rocket_launch</span> LOGISTICS_CO</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-secondary">local_shipping</span> GLOBAL_CARRIER</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-warning">terminal</span> TECH_FLOW</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-success">hub</span> NEXUS_TRANSIT</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-error">public</span> ATLAS_FEE</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-primary">precision_manufacturing</span> MEGA_FLEET</div>
          </div>
          <div aria-hidden="true" className="marquee-content flex items-center justify-around">
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-primary">rocket_launch</span> LOGISTICS_CO</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-secondary">local_shipping</span> GLOBAL_CARRIER</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-warning">terminal</span> TECH_FLOW</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-success">hub</span> NEXUS_TRANSIT</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-error">public</span> ATLAS_FEE</div>
            <div className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface-variant"><span className="material-symbols-outlined text-primary">precision_manufacturing</span> MEGA_FLEET</div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section className="py-24 max-w-[1280px] mx-auto px-10" id="features">
        <div className="text-center mb-16 reveal">
          <h2 className="font-headline text-3xl md:text-4xl font-black mb-4">All-in-One Operating System</h2>
          <p className="text-body text-base text-on-surface-variant max-w-2xl mx-auto font-medium">Powerful features designed to solve the complexity of large-scale fleet management.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: "directions_car", color: "text-primary", title: "Fleet Management", desc: "Track every asset in real-time with granular telemetry data and history." },
            { icon: "badge", color: "text-secondary", title: "Driver Management", desc: "Performance scoring, digital documentation, and automated payroll integration." },
            { icon: "event_upcoming", color: "text-warning", title: "Trip Scheduling", desc: "Dynamic route optimization using live traffic and delivery priority." },
            { icon: "build", color: "text-success", title: "Maintenance", desc: "Predictive alerts before breakdowns occur, reducing downtime by 40%." },
            { icon: "gas_meter", color: "text-error", title: "Fuel Efficiency", desc: "Monitor consumption patterns and identify inefficient routes or habits." },
            { icon: "receipt_long", color: "text-primary", title: "Expense Tracking", desc: "Centralized billing for tolls, fuel, and repairs with automated auditing." },
            { icon: "analytics", color: "text-secondary", title: "Smart Analytics", desc: "Customizable reports that turn complex data into actionable business intelligence." },
            { icon: "map", color: "text-warning", title: "Interactive Maps", desc: "Visualize your entire global operation on a single, high-performance map." },
            { icon: "auto_awesome", color: "text-white bg-primary p-2", fill: true, title: "AI Copilot", desc: "Conversational interface to query fleet data and automate complex task sequences." }
          ].map((item, idx) => (
            <div key={idx} className={`sticker-card p-8 rounded-xl hard-shadow reveal ${item.fill ? 'bg-primary text-white border-2 border-border' : 'bg-white'}`}>
              <span className={`material-symbols-outlined text-4xl ${item.color} mb-6 block w-fit`} style={item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <h3 className="font-headline text-xl font-bold mb-2 uppercase">{item.title}</h3>
              <p className={item.fill ? "text-white/90 text-sm font-medium leading-relaxed" : "text-on-surface-variant text-sm font-medium leading-relaxed"}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Platform Overview (animated with reveal) */}
      <section className="py-24 bg-slate-100 border-y-2 border-border reveal" id="platform">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="order-2 lg:order-1 reveal">
            <div className="relative sticker-card bg-white p-2 rounded-xl hard-shadow">
              <img className="w-full rounded-lg" alt="Data center dashboard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChwuUfslkRAlsKRJEN_keExJewXftMqHUBOiBFengUfdmTf2Ad_KeE-PiKnTU1o-wCyIIA78-OjBo8RZVkv9qIMUK0Z5Sg0k10beTm7lf_iD0zStONK8tawTFiP2Wyv9npT6j41z3RWK0tBOEXOXqWZP6GV3RnPGG7eDQUxa-ibBalS0YEwImt1fj9ahM1E4S2F6lsF0P1NtpBJE2OxE9aswTnBRUCOumdbEjP57tvQgPMXKq4GGhX" />
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-8 reveal">
            <h2 className="font-headline text-3xl md:text-4xl font-black mb-6">Centralized Intelligence for Distributed Operations</h2>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 text-primary rounded flex items-center justify-center border-2 border-border font-black">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold mb-1 text-primary">Fully Centralized</h4>
                <p className="text-on-surface-variant font-medium text-sm">One source of truth for your entire fleet, drivers, and logistical partners.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary/20 text-secondary rounded flex items-center justify-center border-2 border-border font-black">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold mb-1 text-secondary">Real-Time Sync</h4>
                <p className="text-on-surface-variant font-medium text-sm">Sub-second updates on vehicle locations and mission status changes.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-warning/20 text-warning rounded flex items-center justify-center border-2 border-border font-black">
                <span className="material-symbols-outlined">robot_2</span>
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold mb-1 text-warning">Automated Workflows</h4>
                <p className="text-on-surface-variant font-medium text-sm">Replace manual processes with intelligent triggers and policy enforcement.</p>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 6. Dashboard Showcase (animated with reveal) */}
      <section className="py-24 max-w-[1280px] mx-auto px-10 reveal">
        <div className="bg-white rounded-2xl border-4 border-border overflow-hidden hard-shadow">
          <div className="bg-slate-100 p-4 border-b-4 border-border flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex gap-2 bg-white p-1 rounded-lg border-2 border-border">
              <button 
                onClick={() => setDashboardTab('dashboard')}
                className={`px-4 py-2 rounded font-mono text-xs font-bold border transition-all ${
                  dashboardTab === 'dashboard'
                    ? 'bg-primary text-white border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent text-on-surface hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setDashboardTab('trips')}
                className={`px-4 py-2 rounded font-mono text-xs font-bold border transition-all ${
                  dashboardTab === 'trips'
                    ? 'bg-primary text-white border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent text-on-surface hover:bg-slate-100'
                }`}
              >
                Trips
              </button>
              <button 
                onClick={() => setDashboardTab('analytics')}
                className={`px-4 py-2 rounded font-mono text-xs font-bold border transition-all ${
                  dashboardTab === 'analytics'
                    ? 'bg-primary text-white border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-transparent text-on-surface hover:bg-slate-100'
                }`}
              >
                Analytics
              </button>
            </div>
            
            <div className="w-full md:w-64 h-10 bg-white rounded-lg border-2 border-border flex items-center px-4">
              <span className="material-symbols-outlined text-sm mr-2 font-bold">search</span>
              <span className="text-xs font-bold text-slate-400">Search vehicles...</span>
            </div>
          </div>
          
          <div className="p-8 min-h-[500px] flex items-center justify-center relative bg-white dot-grid">
            <div className="w-full h-[500px] bg-contain bg-center bg-no-repeat rounded-lg border-2 border-border hard-shadow-primary" style={{ backgroundImage: `url('${dashboardTab === 'dashboard' ? '/dashboard_showcase.png' : dashboardTab === 'trips' ? '/trips_showcase.png' : '/analytics_showcase.png'}')` }}></div>
          </div>
        </div>
      </section>

      {/* 7. AI Fleet Copilot Chat (animated with reveal) */}
      <section className="py-24 bg-slate-100 border-y-2 border-border reveal" id="copilot">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="reveal">
            <h2 className="font-headline text-3xl md:text-4xl font-black mb-6">Talk to Your Fleet</h2>
            <p className="text-body text-base text-on-surface-variant mb-8 leading-relaxed font-medium">
              Stop digging through spreadsheets. Ask our AI Copilot anything about your operations. From complex cost analysis to urgent maintenance status, the answers are just a message away.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-mono text-sm font-bold">"Which trucks are due for service next week?"</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-mono text-sm font-bold">"Show me fuel trends for the last 90 days."</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-warning font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-mono text-sm font-bold">"Identify the top 5 most efficient drivers."</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl border-2 border-border p-6 hard-shadow h-[400px] flex flex-col justify-between reveal">
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-2">
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] border-2 border-border text-sm font-medium ${
                    msg.sender === 'user'
                      ? 'bg-slate-100 text-on-surface'
                      : 'bg-primary/10 border-primary/20 text-on-surface'
                  }`}>
                    {msg.sender === 'copilot' && (
                      <div className="flex items-center gap-2 mb-2 text-primary font-black">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        Copilot
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask Copilot..." 
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                className="w-full bg-slate-50 border-2 border-border rounded-lg py-3 px-4 focus:ring-0 focus:border-primary text-on-surface font-bold placeholder-slate-400 text-sm"
              />
              <button 
                onClick={handleSendCopilot}
                className="absolute right-2 top-2 bg-primary text-white p-2 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined font-bold text-sm">send</span>
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* 8. Stats */}
      <section className="py-24 border-b-2 border-border bg-white">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-2 lg:grid-cols-5 gap-8 text-center">
          {[
            { val: "12k+", desc: "Vehicles Managed", color: "text-primary" },
            { val: "1M+", desc: "Monthly Trips", color: "text-secondary" },
            { val: "500+", desc: "Organizations", color: "text-warning" },
            { val: "25k+", desc: "Active Drivers", color: "text-success" },
            { val: "15%", desc: "Fuel Saved Avg.", color: "text-error" }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-xl border-2 border-border bg-slate-50 shadow-[4px_4px_0px_0px_#1E293B] reveal">
              <div className={`text-4xl font-headline font-black mb-2 ${stat.color}`}>{stat.val}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest font-black opacity-70">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. How It Works */}
      <section className="py-24 max-w-[1280px] mx-auto px-10 bg-background">
        <h2 className="font-headline text-3xl font-black text-center mb-16 underline decoration-primary decoration-4 underline-offset-8 reveal">The Path to Efficiency</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {[
            { step: "01", color: "text-primary", title: "Register", desc: "Setup your profile in minutes." },
            { step: "02", color: "text-secondary", title: "Add Assets", desc: "Import vehicles and drivers." },
            { step: "03", color: "text-warning", title: "Create Trips", desc: "Plan and schedule missions." },
            { step: "04", color: "text-success", title: "Track Live", desc: "Monitor progress in real-time." },
            { step: "05", color: "text-error", title: "Analyze", desc: "Review detailed performance." },
            { step: "06", color: "text-primary", title: "Optimize", desc: "Automate based on data." }
          ].map((step, idx) => (
            <div key={idx} className="text-center group reveal">
              <div className="w-16 h-16 bg-white border-2 border-border rounded-xl flex items-center justify-center mx-auto mb-6 hard-shadow group-hover:hard-shadow-primary transition-all">
                <span className={`font-headline text-xl font-black ${step.color}`}>{step.step}</span>
              </div>
              <h4 className="font-headline text-sm mb-2 font-black uppercase">{step.title}</h4>
              <p className="text-[11px] text-on-surface-variant font-bold leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Comparison (animated with reveal) */}
      <section className="py-24 bg-slate-100 border-y-2 border-border reveal">
        <div className="max-w-[1280px] mx-auto px-10">
          <h2 className="font-headline text-3xl font-black text-center mb-16 underline decoration-secondary decoration-4 underline-offset-8">Why TransitOps?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-border rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_#1E293B]">
            <div className="bg-white p-8 border-r-2 border-border flex items-center">
              <h3 className="font-headline text-2xl font-black uppercase">Comparison</h3>
            </div>
            
            <div className="p-8 border-r-2 border-border bg-slate-50">
              <h4 className="font-headline text-lg text-on-surface-variant mb-6 font-black uppercase">Traditional Software</h4>
              <ul className="space-y-4 font-mono text-xs font-bold">
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-error font-black text-sm">close</span> Manual data entry
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-error font-black text-sm">close</span> Delayed reporting (24h+)
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-error font-black text-sm">close</span> Siloed communications
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-error font-black text-sm">close</span> Fragmented security
                </li>
              </ul>
            </div>
            
            <div className="p-8 bg-white">
              <h4 className="font-headline text-lg text-primary mb-6 font-black uppercase">TransitOps</h4>
              <ul className="space-y-4 font-mono text-xs font-bold">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success font-black text-sm">check_circle</span> Automated IoT ingestion
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success font-black text-sm">check_circle</span> Real-time AI processing
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success font-black text-sm">check_circle</span> Unified fleet ecosystem
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success font-black text-sm">check_circle</span> SOC 2 Type II Security
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="py-24 max-w-[1280px] mx-auto px-10 bg-background">
        <h2 className="font-headline text-3xl font-black text-center mb-16 reveal">Trusted by Fleet Leaders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "TransitOps reduced our maintenance costs by 22% in the first quarter. The AI insights are scary accurate.", author: "Sarah Chen", role: "Operations Director, SwiftLogix", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPImephVZ2v0nh1CSNKMRTemChQPdrwVpFR1DgRGp5zUUOP3mNRM2s4weXkH2A0qMV0jj0Ze7iMgfptrr5gBG9J4JS5A05IA28D1ifzWk8_jZS98DTmJxeRHrAhdnI-HlkouNkRT6PnSaJyjAxbZ5uv20GAPTybHQ9BMU5KPv5CdjEkeCBS61xXNnaL7Pp8HmBTF2uRK1XcG1qZYpCdEkEDOOgTbx8gZjIq0-76VDggPqy82Ig36mP", color: "border-primary" },
            { quote: "The UI is a breath of fresh air. Our drivers actually enjoy using the mobile app, which improved data quality overnight.", author: "Marcus Thorne", role: "CEO, Atlas Freight", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCymSDAXk4EFXKXy1boLMqVNTzb1XpnmvPSOWYBtLJ-KnETwK24qLa-BsttktKZJyzlfIm8wfHGJ5vckMoFoYCH9mgADWRsRojvbU-cjy1iNwpQnkUgxuJVnjLHzZJ9c0P6BL1A9z5AQrvDMrl7SgTnKjlwk1Ab0Y7Q6thu0gynLzGCU-uR2xfHokRdu7LzYf1TbHdfLHFQS-mME4Xgd1LeUFBtL8U3gw4rQG_WkJr7KrgvyKU66Gbo", color: "border-secondary" },
            { quote: "Scaling to 500+ vehicles was seamless. The automation workflows handle the heavy lifting for us.", author: "David Miller", role: "VP Ops, CityRide Global", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS0rMmgMsVNNcwbvctzlfkCOEUVJRMzuaoiSyAId5LXLfdNfls01ITOMv7uMI5kaG0GnWNge7xu4GypeGZQYf0fDRkWdgVZPrH0o98ceNeOVuaAIk8gKKCE8_0eLie8ZCp0cL3vvMEjzfLM7CjFp2zqhcM4MGM_6BEXSLcXfId_zvaTtk3DOLA7MnKZZRaKyasZsvpOkdWa7G9exHpx5rnJQIy8mGVJM_lDh_4ojImnzkHvSi2tIoN", color: "border-warning" }
          ].map((item, idx) => (
            <div key={idx} className="sticker-card p-8 bg-white rounded-xl hard-shadow reveal">
              <p className="text-body text-base italic mb-8 font-medium">"{item.quote}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${item.color}`}>
                  <img className="w-full h-full object-cover" alt={item.author} src={item.img} />
                </div>
                <div>
                  <div className="font-headline font-bold text-sm text-on-surface uppercase">{item.author}</div>
                  <div className="font-mono text-[10px] text-on-surface-variant font-bold">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. FAQ Accordion (animated with reveal) */}
      <section className="py-24 bg-slate-100 border-t-2 border-border reveal" id="faq">
        <div className="max-w-2xl mx-auto px-10">
          <h2 className="font-headline text-3xl font-black text-center mb-12 underline decoration-warning decoration-4 underline-offset-8">Common Questions</h2>
          
          <div className="space-y-4">
            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">How secure is my fleet data?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                We employ bank-grade encryption (AES-256) for all data at rest and in transit. Our systems are SOC 2 Type II compliant and undergo regular third-party penetration testing.
              </p>
            </details>
            
            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">Do we need specialized hardware?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                TransitOps integrates with most major OEM telematics systems and third-party ELDs. We also provide our own plug-and-play OBD-II devices for older fleets.
              </p>
            </details>

            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">Can we track fuel card transactions?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                Yes! TransitOps supports automated importing of commercial fuel card transaction data (such as IOCL, HPCL, BPCL, or custom corporate cards) to dynamically audit fuel purchases against GPS mileage records and prevent theft.
              </p>
            </details>

            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">Is there offline support for mobile drivers?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                Yes. The TransitOps driver application caches GPS telemetry, trip logs, and compliance document uploads locally on the device when cell reception is lost, automatically syncing them with the console once connectivity is restored.
              </p>
            </details>

            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">What is the integration process with existing ERPs?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                We provide developer-friendly REST APIs and webhooks to synchronize dispatcher schedules, payroll records, maintenance expenses, and vehicle statuses directly with existing systems like SAP, Oracle, or custom databases.
              </p>
            </details>

            <details className="group sticker-card bg-white rounded-lg p-6 transition-all duration-200 hard-shadow reveal">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-headline text-base font-black uppercase">How does the AI Copilot assist dispatchers?</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180 font-black">expand_more</span>
              </summary>
              <p className="mt-4 text-on-surface-variant font-medium text-xs leading-relaxed">
                The AI Copilot continuously monitors telemetry data, driver logs, driver safety scores, and maintenance status to recommend optimal vehicle-driver pairings and flag potential risk issues before dispatching trips.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="bg-white border-t-2 border-border pt-20 pb-10">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-2 md:grid-cols-5 gap-8 mb-20">
          <div className="col-span-2">
            <a className="font-headline text-2xl font-black text-on-surface mb-6 block uppercase" href="#">
              <span className="bg-primary text-white px-2 rounded mr-1">T</span>TransitOps
            </a>
            <p className="text-on-surface-variant text-sm mb-8 max-w-xs font-bold leading-relaxed">
              Building the future of intelligent logistics and transport management. Global operations, simplified.
            </p>
          </div>
          <div>
            <h5 className="font-headline text-xs mb-6 uppercase tracking-widest text-primary font-black">Product</h5>
            <ul className="space-y-4 font-mono text-xs text-on-surface-variant font-bold">
              <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline text-xs mb-6 uppercase tracking-widest text-secondary font-black">Company</h5>
            <ul className="space-y-4 font-mono text-xs text-on-surface-variant font-bold">
              <li><a className="hover:text-secondary transition-colors" href="#">About</a></li>
              <li><a className="hover:text-secondary transition-colors" href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline text-xs mb-6 uppercase tracking-widest text-warning font-black">Newsletter</h5>
            <div className="flex border-2 border-border rounded bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input 
                className="bg-transparent px-3 py-2 text-xs font-bold focus:outline-none flex-grow min-w-0" 
                placeholder="Email address" 
                type="email" 
              />
              <button className="bg-primary text-white px-4 py-2 text-xs font-black border-l-2 border-border hover:opacity-90 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-10 pt-10 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-on-surface-variant font-bold">© 2026 TransitOps. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}
