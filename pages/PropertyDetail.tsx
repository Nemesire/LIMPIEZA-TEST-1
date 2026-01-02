
import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Calendar as CalendarIcon, 
  AlertCircle, Plus, Trash2, X, Users, 
  StickyNote, MapPin, Info, Link as LinkIcon,
  Wifi, WifiOff, Hash, Phone, Key, CalendarX, Edit2, Save, Image as ImageIcon, AlignLeft, Upload, ClipboardPaste, Clock, Check,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  LogOut,
  BedDouble,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Reservation, Property } from '../types';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, reservations, addICalLink, removeICalLink, syncAll, clearReservations, updateProperty, updateReservation, isLoading } = useStore();
  const property = properties.find(p => p.id === id);

  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Property>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const propertyReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return reservations
      .filter(r => r.propertyId === id && r.checkOut >= todayStr)
      .sort((a, b) => {
        const dateA = new Date(a.checkIn).getTime();
        const dateB = new Date(b.checkIn).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
      });
  }, [reservations, id]);

  const handleManualSync = async () => {
    try {
      await syncAll();
    } catch (e) {
      alert("Error al sincronizar");
    }
  };

  const handleClearThisCalendar = () => {
    if (window.confirm("¿Vaciar todas las reservas de este anuncio?")) {
      clearReservations(id);
    }
  };

  const openEditModal = () => {
    if (!property) return;
    setEditData({
      name: property.name,
      internalName: property.internalName || '',
      imageUrl: property.imageUrl,
      address: property.address,
      description: property.description || ''
    });
    setShowEditPropertyModal(true);
  };

  const handleSavePropertyEdit = () => {
    if (!property) return;
    updateProperty({ ...property, ...editData as Property });
    setShowEditPropertyModal(false);
  };

  const calculateDays = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const current = propertyReservations.find(r => todayStr >= r.checkIn && todayStr <= r.checkOut);
    
    if (current) {
      const isCheckingOutToday = current.checkOut === todayStr;
      return {
        label: isCheckingOutToday ? 'SALIDA HOY' : 'OCUPADO',
        guest: current.guestName,
        color: isCheckingOutToday ? 'bg-orange-500' : 'bg-blue-600',
        icon: isCheckingOutToday ? LogOut : BedDouble
      };
    }
    return {
      label: 'DISPONIBLE / LIMPIO',
      guest: 'Sin huéspedes actualmente',
      color: 'bg-emerald-500',
      icon: CheckCircle2
    };
  };

  if (!property) return <div className="p-8 text-center text-gray-500 font-bold">Propiedad no encontrada</div>;

  const status = getStatusInfo();

  const BigReservationCard = ({ res, title, colorClass }: { res: Reservation, title: string, colorClass: string, key?: React.Key }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempRes, setTempRes] = useState<Partial<Reservation>>({
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      checkInTime: res.checkInTime || '14:00',
      checkOutTime: res.checkOutTime || '11:00',
      guestName: res.guestName,
      guestCount: res.guestCount || 1,
      observations: res.observations || ''
    });

    const isReal = res.id.startsWith('real-');

    const handleSave = () => {
      updateReservation(res.id, tempRes);
      setIsEditing(false);
    };

    return (
      <div className={`rounded-[2.5rem] p-8 text-left relative overflow-hidden transition-all border shadow-2xl animate-in fade-in duration-500 ${colorClass}`}>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <CalendarIcon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 text-white">{title}</h3>
                <p className="text-xl font-black text-white flex items-center gap-2">
                  {isReal ? <Wifi size={18} className="text-green-300 animate-pulse" /> : <WifiOff size={18} className="text-orange-300" />}
                  {isReal ? 'SINCRONIZADO' : 'MANUAL'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-6 py-2 bg-white text-gray-900 rounded-full font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
               >
                 {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
                 {isEditing ? 'GUARDAR' : 'EDITAR'}
               </button>
               {!isEditing && (
                 <div className="px-5 py-2 bg-white/20 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase">
                   {calculateDays(res.checkIn, res.checkOut)} NOCHES
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Huésped</p>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-white/20 text-white border-none rounded-xl p-2 font-black uppercase text-xl outline-none"
                  value={tempRes.guestName}
                  onChange={e => setTempRes({...tempRes, guestName: e.target.value})}
                />
              ) : (
                <p className="text-4xl font-black text-white uppercase truncate">{res.guestName}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black text-white flex items-center gap-1">
                  <Hash size={12} /> {res.reservationCode || 'S/N'}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black text-white flex items-center gap-1">
                  <Users size={12} /> 
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="bg-transparent w-8 outline-none" 
                      value={tempRes.guestCount}
                      onChange={e => setTempRes({...tempRes, guestCount: parseInt(e.target.value)})}
                    />
                  ) : (res.guestCount || 1)} PAX
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 lg:col-span-1">
              <div className="text-center flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white mb-2 italic">ENTRADA</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="date" className="w-full bg-white/20 text-white border-none rounded-lg p-1 text-[10px]" value={tempRes.checkIn} onChange={e => setTempRes({...tempRes, checkIn: e.target.value})} />
                    <input type="time" className="w-full bg-white/20 text-white border-none rounded-lg p-1 text-[10px]" value={tempRes.checkInTime} onChange={e => setTempRes({...tempRes, checkInTime: e.target.value})} />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-black text-white">{new Date(res.checkIn + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/70 mt-1 uppercase tracking-widest bg-white/10 rounded-full py-0.5">
                      <Clock size={10} /> {res.checkInTime || '14:00'}
                    </div>
                  </>
                )}
              </div>
              <div className="w-px h-16 bg-white/20"></div>
              <div className="text-center flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white mb-2 italic">SALIDA</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="date" className="w-full bg-white/20 text-white border-none rounded-lg p-1 text-[10px]" value={tempRes.checkOut} onChange={e => setTempRes({...tempRes, checkOut: e.target.value})} />
                    <input type="time" className="w-full bg-white/20 text-white border-none rounded-lg p-1 text-[10px]" value={tempRes.checkOutTime} onChange={e => setTempRes({...tempRes, checkOutTime: e.target.value})} />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-black text-white">{new Date(res.checkOut + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-white/70 mt-1 uppercase tracking-widest bg-white/10 rounded-full py-0.5">
                      <Clock size={10} /> {res.checkOutTime || '11:00'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Logística</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Key size={18} className="text-white/80" />
                  <p className="text-xs font-bold text-white/90 uppercase tracking-widest">Entrega Llaves</p>
                </div>
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-white/80" />
                  <p className="text-[9px] font-bold text-white/70 uppercase leading-tight">La limpieza debe ocurrir tras el Check-out.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-5 rounded-[1.5rem] backdrop-blur-sm border border-white/10 flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2 flex items-center gap-2">
                <StickyNote size={14} /> Notas
              </p>
              {isEditing ? (
                <textarea 
                  className="flex-1 bg-transparent text-white text-[10px] outline-none border-none resize-none font-bold"
                  value={tempRes.observations}
                  onChange={e => setTempRes({...tempRes, observations: e.target.value})}
                />
              ) : (
                <p className="text-[10px] font-bold italic leading-relaxed text-white line-clamp-3">
                  {res.observations || 'Sin notas adicionales.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 text-left">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 text-left">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 font-bold mb-4 hover:text-blue-600 transition-colors">
            <ArrowLeft size={18} /> Panel Principal
          </button>
          <div className="flex items-center gap-4 group">
            <div className="flex flex-col">
              <h2 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
                {property.internalName || property.name}
              </h2>
              {property.internalName && (
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2">{property.name}</p>
              )}
            </div>
            <button onClick={openEditModal} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all"><Edit2 size={24} /></button>
          </div>
          <p className="text-gray-400 font-bold flex items-center gap-2 mt-3 uppercase text-xs tracking-[0.2em]"><MapPin size={16} className="text-blue-500" /> {property.address}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <button onClick={handleClearThisCalendar} className="p-5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors shadow-lg active:scale-95"><CalendarX size={24} /></button>
            <button onClick={handleManualSync} disabled={isLoading} className="px-8 py-5 bg-blue-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-700 shadow-2xl transition-all disabled:opacity-50">
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-[2rem] ${status.color} flex items-center justify-center text-white shadow-2xl`}>
            <status.icon size={36} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Estado en Tiempo Real</p>
            <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">{status.label}</h4>
            <p className="text-sm font-bold text-gray-500 uppercase mt-2">{status.guest}</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-center">
             <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Reservas</p>
             <p className="text-2xl font-black text-blue-600">{propertyReservations.length}</p>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-center">
             <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Tipo Unidad</p>
             <p className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">{property.type === 'whole' ? 'CASA' : 'HAB'}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-gray-100 dark:border-slate-800 pb-4">
           <div className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-lg"><Users size={24}/></div>
           <div className="text-left">
             <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white italic">Agenda Completa de Estancias</h3>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visualización total de entradas y salidas ordenadas por fecha.</p>
           </div>
        </div>

        <div className="space-y-8">
          {propertyReservations.length > 0 ? (
            propertyReservations.map((res, idx) => {
              const now = new Date();
              now.setHours(0,0,0,0);
              const todayStr = now.toISOString().split('T')[0];
              const isCurrent = todayStr >= res.checkIn && todayStr <= res.checkOut;
              const isCheckingOutToday = res.checkOut === todayStr;
              let title = "RESERVA FUTURA";
              let colorClass = "bg-gray-900 dark:bg-slate-800 border-gray-800 text-white";
              if (isCurrent) {
                title = isCheckingOutToday ? "FINALIZA HOY (SALIDA)" : "ESTANCIA EN CURSO";
                colorClass = isCheckingOutToday ? "bg-orange-600 border-orange-500 shadow-orange-100" : "bg-blue-600 border-blue-500 shadow-blue-200";
              } else if (idx === 0 || (propertyReservations[0].checkOut < todayStr && idx === 1)) {
                title = "SIGUIENTE HUÉSPED";
                colorClass = "bg-emerald-600 border-emerald-500 shadow-emerald-100";
              }
              return <BigReservationCard key={res.id} res={res} title={title} colorClass={colorClass} />;
            })
          ) : (
            <div className="py-24 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-gray-200 dark:border-slate-800 opacity-50">
               <AlertCircle size={64} className="mx-auto mb-6 text-gray-300" />
               <p className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Sin Reservas Detectadas</p>
               <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2">Sincroniza o añade manualmente una reserva para verla aquí.</p>
            </div>
          )}
        </div>
      </section>

      {showEditPropertyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Editar Anuncio</h4>
              <button onClick={() => setShowEditPropertyModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Foto Principal</label>
                <div className="relative group">
                  <div className="w-full h-56 rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700">
                    {editData.imageUrl ? <img src={editData.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2"><ImageIcon size={48} /></div>}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-3xl backdrop-blur-sm">
                    <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white text-gray-900 rounded-full"><Upload size={20} /></button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditData({...editData, imageUrl: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1"><Tag size={12}/> Nombre Interno (Gestión)</label>
                  <input type="text" className="w-full p-4 bg-blue-50/50 dark:bg-blue-900/10 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-black uppercase text-xs" value={editData.internalName} onChange={e => setEditData({...editData, internalName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Título Comercial</label>
                  <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-700 rounded-2xl font-bold" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Dirección</label>
                  <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-700 rounded-2xl font-bold" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                </div>
              </div>

              <button onClick={handleSavePropertyEdit} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={20} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
