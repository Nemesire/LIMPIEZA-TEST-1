
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Camera,
  X,
  Upload,
  ChevronRight,
  AlertCircle,
  ClipboardPaste,
  ShoppingCart,
  PackageSearch,
  AlertTriangle,
  ChevronDown,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Zap,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  Star,
  ClipboardCheck,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
  Repeat
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { geminiService } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { properties, reservations, inventory, isLoading, addBulkReservations } = useStore();
  const navigate = useNavigate();
  
  // AI Import State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para el modal de Día Crítico
  const [selectedCriticalDay, setSelectedCriticalDay] = useState<{
    date: string;
    collisions: {
      propertyId: string;
      propertyName: string;
      outGuest: any;
      inGuest: any;
    }[];
  } | null>(null);

  // Fechas útiles
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Cálculo de Limpiezas para el Widget de Cabecera
  const cleaningsTodayInfo = useMemo(() => {
    const todayCleanings = reservations.filter(r => r.checkOut === todayStr);
    return todayCleanings.map(res => {
      const prop = properties.find(p => p.id === res.propertyId);
      return prop?.internalName || prop?.name || 'Desconocido';
    });
  }, [reservations, properties, todayStr]);

  // Cálculo de Días Críticos Generales
  const criticalDays = useMemo(() => {
    const datesMap: Record<string, Set<string>> = {};
    reservations.forEach(res => {
      const { propertyId, checkOut } = res;
      if (reservations.some(r => r.propertyId === propertyId && r.checkIn === checkOut)) {
        if (!datesMap[checkOut]) datesMap[checkOut] = new Set();
        datesMap[checkOut].add(propertyId);
      }
    });
    return Object.entries(datesMap)
      .map(([date, props]) => ({ date, count: props.size, propertyIds: Array.from(props) }))
      .filter(d => d.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4); 
  }, [reservations, todayStr]);

  // LÓGICA REFORZADA: Casa Amplia para Grupos y Familia
  const casaAmpliaCritical = useMemo(() => {
    const casaAmplia = properties.find(p => 
      (p.internalName || p.name).toUpperCase().includes("CASA AMPLIA")
    );
    if (!casaAmplia) return null;

    const criticalRes = reservations.find(res => {
      return res.propertyId === casaAmplia.id && 
             res.checkOut >= todayStr && 
             reservations.some(r => r.propertyId === casaAmplia.id && r.checkIn === res.checkOut);
    });

    if (!criticalRes) return { property: casaAmplia, date: null };

    const date = criticalRes.checkOut;
    const outGuest = criticalRes;
    const inGuest = reservations.find(r => r.propertyId === casaAmplia.id && r.checkIn === date);

    return {
      property: casaAmplia,
      date,
      outGuest,
      inGuest
    };
  }, [reservations, properties, todayStr]);

  const handleOpenCriticalDetail = (date: string, propertyIds: string[]) => {
    const collisions = propertyIds.map(pid => {
      const property = properties.find(p => p.id === pid);
      const outGuest = reservations.find(r => r.propertyId === pid && r.checkOut === date);
      const inGuest = reservations.find(r => r.propertyId === pid && r.checkIn === date);
      return { 
        propertyId: pid, 
        propertyName: property?.internalName || property?.name || 'Desconocido', 
        outGuest, 
        inGuest 
      };
    });
    setSelectedCriticalDay({ date, collisions });
  };

  const shoppingList = useMemo(() => inventory.filter(item => item.stock <= item.minStock), [inventory]);

  const stats = useMemo(() => {
    const todayCleaningsRes = reservations.filter(r => r.checkOut === todayStr);
    const todayCheckInsRes = reservations.filter(r => r.checkIn === todayStr);
    const todayCheckOutsRes = reservations.filter(r => r.checkOut === todayStr);

    return [
      { 
        label: 'Limpiezas Hoy', 
        val: todayCleaningsRes.length.toString(), 
        color: 'bg-blue-600 text-white', 
        icon: CheckCircle2, 
        action: () => navigate('/schedule'),
        details: [
          { label: 'Salidas', val: todayCheckOutsRes.length, icon: LogOutIcon },
          { label: 'Entradas', val: todayCheckInsRes.length, icon: LogInIcon }
        ]
      },
      { 
        label: 'CHECK-IN', 
        val: todayCheckInsRes.length.toString(), 
        color: 'bg-emerald-500 text-white', 
        icon: LogIn, 
        action: () => navigate('/calendar'),
        propertyList: todayCheckInsRes.map(r => {
          const p = properties.find(prop => prop.id === r.propertyId);
          return { name: p?.internalName || p?.name || '?', isTurnover: false };
        })
      },
      { 
        label: 'CHECK-OUT', 
        val: todayCheckOutsRes.length.toString(), 
        color: 'bg-red-600 text-white', 
        icon: LogOut, 
        action: () => navigate('/calendar'),
        propertyList: todayCheckOutsRes.map(r => {
          const p = properties.find(prop => prop.id === r.propertyId);
          const isTurnover = todayCheckInsRes.some(inRes => inRes.propertyId === r.propertyId);
          return { name: p?.internalName || p?.name || '?', isTurnover };
        })
      },
      { label: 'Falta Stock', val: shoppingList.length.toString(), color: 'bg-amber-500 text-white', icon: ShoppingCart, action: () => navigate('/inventory') },
      { label: 'Total Reservas', val: reservations.length.toString(), color: 'bg-gray-900 text-white', icon: Clock, action: () => navigate('/calendar') },
    ];
  }, [reservations, properties, shoppingList, todayStr, navigate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left pb-12">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic leading-none">Gestión Logística</h2>
            <p className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Bienvenido al Centro de Mando</p>
          </div>

          {/* WIDGET AMPLIADO: LIMPIEZAS HOY */}
          <button 
            onClick={() => navigate('/schedule')}
            className="flex items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.2rem] border-2 border-gray-100 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all group min-w-[320px] max-w-2xl"
          >
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardCheck size={32} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 italic">Limpiezas Hoy ({cleaningsTodayInfo.length})</p>
              <div className="flex flex-wrap gap-2">
                {cleaningsTodayInfo.length > 0 ? (
                  cleaningsTodayInfo.slice(0, 4).map((name, idx) => (
                    <span key={idx} className="text-[11px] font-extrabold text-gray-900 dark:text-white uppercase italic bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-slate-700 truncate max-w-[150px]">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-gray-400 uppercase italic">Operación Despejada</span>
                )}
              </div>
            </div>
          </button>
        </div>

        <button onClick={() => setShowAiModal(true)} className="px-8 py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-200/50 shrink-0">
          <Sparkles size={18} /> Escanear Reservas
        </button>
      </header>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <button key={i} onClick={stat.action} className={`${stat.color} p-6 rounded-[2.2rem] shadow-xl flex flex-col gap-4 transition-all hover:translate-y-[-4px] text-left group relative overflow-hidden min-h-[160px]`}>
            <div className="absolute top-[-20%] right-[-10%] opacity-10"><stat.icon size={100} /></div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md shrink-0"><stat.icon size={20} /></div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{stat.label}</p>
                <p className="text-5xl font-black leading-none tracking-tight">{stat.val}</p>
              </div>
              
              {stat.propertyList && stat.propertyList.length > 0 && (
                <div className="mt-4 space-y-2">
                  {stat.propertyList.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white/10 p-2 rounded-xl border border-white/10">
                      <p className="text-[9px] font-bold uppercase italic truncate text-white">{item.name}</p>
                      {item.isTurnover && (
                        <span className="flex items-center gap-1 bg-white text-red-600 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase italic shrink-0">
                          <Repeat size={8} /> Rotatorio
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Día Crítico */}
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-red-100 dark:border-red-900/30 pb-3">
            <Zap size={22} className="text-red-600 fill-red-600" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Día Crítico (General)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {criticalDays.map((day, i) => (
              <div key={i} onClick={() => handleOpenCriticalDetail(day.date, day.propertyIds)} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-red-500/20 hover:border-red-500 shadow-lg cursor-pointer transition-all">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-1">
                  <Calendar size={12} /> {day.date === todayStr ? 'HOY' : new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()}
                </p>
                <h4 className="text-4xl font-black text-gray-900 dark:text-white leading-none mb-1 tracking-tight">{day.count}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rotaciones</p>
              </div>
            ))}
          </div>
        </section>

        {/* Casa Amplia */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-indigo-100 dark:border-indigo-900/30 pb-3">
            <ShieldAlert size={22} className="text-indigo-600 fill-indigo-600" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Día Crítico: Casa Amplia</h3>
          </div>
          
          {casaAmpliaCritical && casaAmpliaCritical.date ? (
            <div onClick={() => handleOpenCriticalDetail(casaAmpliaCritical.date!, [casaAmpliaCritical.property!.id])} className="bg-gray-900 dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-indigo-500 shadow-2xl cursor-pointer hover:bg-indigo-950 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-full">Prioridad Máxima</span>
                  <h4 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none">{casaAmpliaCritical.property?.internalName}</h4>
                  <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-widest">{new Date(casaAmpliaCritical.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }).toUpperCase()}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Sale</p>
                    <p className="text-lg font-black text-white italic truncate">{casaAmpliaCritical.outGuest?.guestName}</p>
                  </div>
                  <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Entra</p>
                    <p className="text-lg font-black text-white italic truncate">{casaAmpliaCritical.inGuest?.guestName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">Gestionar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-800 text-center">
              <p className="text-xl font-black text-gray-400 uppercase italic tracking-tight">Sin rotaciones críticas próximas</p>
            </div>
          )}
        </section>
      </div>

      {/* AI Modal Placeholder */}
      {showAiModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl p-10 text-center">
             <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic mb-6 tracking-tight">Importación IA</h4>
             <button onClick={() => setShowAiModal(false)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
