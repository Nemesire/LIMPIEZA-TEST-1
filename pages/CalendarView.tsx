
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  X, 
  ArrowRight, 
  MapPin, 
  User, 
  LogIn, 
  LogOut, 
  Hash, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  BedDouble,
  DoorOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  Edit3,
  Check,
  Users,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Reservation } from '../types';

const CalendarView: React.FC = () => {
  const { reservations, properties, clearReservations, updateReservation, deleteReservation } = useStore();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ 
    day: number, 
    dateStr: string, 
    checkIns: any[],
    checkOuts: any[],
    ongoing: any[]
  } | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    refreshModalData(dateStr, day);
  };

  const refreshModalData = (dateStr: string, day: number) => {
    const checkIns = reservations.filter(res => res.checkIn === dateStr);
    const checkOuts = reservations.filter(res => res.checkOut === dateStr);
    const ongoing = reservations.filter(res => dateStr > res.checkIn && dateStr < res.checkOut);
    setSelectedDayInfo({ day, dateStr, checkIns, checkOuts, ongoing });
  }

  const handleClearAll = () => clearReservations();

  const getEventsSummary = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(res => 
      res.checkIn === dateStr || 
      res.checkOut === dateStr || 
      (dateStr > res.checkIn && dateStr < res.checkOut)
    );
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
  };

  const EditableReservationCard: React.FC<{ res: Reservation; type: 'in' | 'out' }> = ({ res, type }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      guestName: res.guestName,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      checkInTime: res.checkInTime || '14:00',
      checkOutTime: res.checkOutTime || '11:00',
      guestCount: res.guestCount || 1
    });

    const prop = properties.find(p => p.id === res.propertyId);

    const handleSave = () => {
      updateReservation(res.id, formData);
      setIsEditing(false);
      if (selectedDayInfo) refreshModalData(selectedDayInfo.dateStr, selectedDayInfo.day);
    };

    const handleDelete = () => {
      if (window.confirm(`¿Borrar reserva de ${res.guestName}?`)) {
        deleteReservation(res.id);
        if (selectedDayInfo) refreshModalData(selectedDayInfo.dateStr, selectedDayInfo.day);
      }
    };

    const goToProperty = () => {
      setSelectedDayInfo(null);
      navigate(`/property/${res.propertyId}`);
    };

    const colorScheme = type === 'in' ? 'border-emerald-500 bg-emerald-50/30' : 'border-orange-500 bg-orange-50/30';

    return (
      <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border-2 transition-all group ${isEditing ? colorScheme : 'border-gray-100 dark:border-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${type === 'in' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'}`}>
            {type === 'in' ? <LogIn size={20} /> : <LogOut size={20} />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-3 text-gray-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${isEditing ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-blue-600'}`}>
              {isEditing ? <Check size={14} /> : <Edit3 size={14} />} {isEditing ? 'Guardar' : 'Ajustar'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input type="text" className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-3 font-black uppercase text-xs" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
               <input type="date" className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-2 text-[10px]" value={type === 'in' ? formData.checkIn : formData.checkOut} onChange={e => setFormData({...formData, [type === 'in' ? 'checkIn' : 'checkOut']: e.target.value})} />
               <input type="time" className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-2 text-[10px]" value={type === 'in' ? formData.checkInTime : formData.checkOutTime} onChange={e => setFormData({...formData, [type === 'in' ? 'checkInTime' : 'checkOutTime']: e.target.value})} />
            </div>
          </div>
        ) : (
          <div className="cursor-pointer" onClick={goToProperty}>
            <h6 className="text-xl font-black text-gray-900 dark:text-white uppercase italic truncate mb-1 group-hover:text-blue-600 transition-colors">{res.guestName}</h6>
            <p className="text-[10px] font-black text-blue-600 flex items-center gap-2 uppercase tracking-tight mb-4">
               <MapPin size={12} /> {prop?.internalName || prop?.name}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-800">
               <div className="flex items-center gap-2 text-gray-400"><Clock size={14} /><span className="text-[10px] font-black uppercase">{type === 'in' ? formData.checkInTime : formData.checkOutTime}</span></div>
               <div className="flex items-center gap-2 text-gray-400"><Users size={14} /><span className="text-[10px] font-black uppercase">{res.guestCount || 1} Pers.</span></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Calendario Maestro</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Gestiona la disponibilidad global.</p>
        </div>
        <button onClick={handleClearAll} className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"><Trash2 size={24} /></button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase italic">
            <CalIcon className="text-blue-600" size={28} /> {monthNames[month]} {year}
          </h3>
          <div className="flex gap-3">
            <button onClick={prevMonth} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"><ChevronLeft size={24} /></button>
            <button onClick={nextMonth} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-gray-50 dark:border-slate-800">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/20">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-[600px] md:h-[700px]">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="border-r border-b border-gray-50 dark:border-slate-800 opacity-20" />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const events = getEventsSummary(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return (
              <div key={day} onClick={() => handleDayClick(day)} className={`border-r border-b border-gray-50 dark:border-slate-800 p-2 overflow-y-auto cursor-pointer hover:bg-blue-50/30 transition-all group relative ${isToday ? 'bg-blue-50/40' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black p-2 rounded-lg ${isToday ? 'bg-blue-600 text-white' : 'text-gray-400 group-hover:text-blue-500'}`}>{day}</span>
                  <div className="flex gap-0.5">
                     {events.some(e => e.checkIn === dateStr) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                     {events.some(e => e.checkOut === dateStr) && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                  </div>
                </div>
                <div className="space-y-1">
                  {events.map(event => {
                    if (event.checkIn !== dateStr && event.checkOut !== dateStr) return null;
                    const prop = properties.find(p => p.id === event.propertyId);
                    return (
                      <div key={event.id} className={`text-[8px] p-1 rounded-lg font-black truncate border uppercase italic tracking-tighter ${event.checkIn === dateStr ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50' : 'bg-orange-100 text-orange-700 border-orange-200/50'}`}>
                        {event.checkIn === dateStr ? '↓' : '↑'} {prop?.internalName || prop?.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDayInfo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-gray-50 dark:bg-slate-950 rounded-[4rem] w-full max-w-6xl p-14 shadow-2xl flex flex-col max-h-[92vh] border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-3 italic">Detalle de Agenda</p>
                <h4 className="text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none capitalize">{getDayName(selectedDayInfo.dateStr)}, {selectedDayInfo.day}</h4>
              </div>
              <button onClick={() => setSelectedDayInfo(null)} className="p-6 bg-white dark:bg-slate-900 text-gray-400 hover:text-red-500 rounded-[2.5rem] shadow-2xl transition-all active:scale-90"><X size={40} /></button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pr-4">
              <div className="space-y-6 text-left">
                <h5 className="text-2xl font-black text-orange-600 uppercase italic flex items-center gap-3 border-b-4 border-orange-500 pb-4"><ArrowUpCircle size={28} /> Salidas</h5>
                <div className="grid gap-4">{selectedDayInfo.checkOuts.map(event => <EditableReservationCard key={event.id} res={event} type="out" />)}</div>
              </div>
              <div className="space-y-6 text-left">
                <h5 className="text-2xl font-black text-emerald-600 uppercase italic flex items-center gap-3 border-b-4 border-emerald-500 pb-4"><ArrowDownCircle size={28} /> Entradas</h5>
                <div className="grid gap-4">{selectedDayInfo.checkIns.map(event => <EditableReservationCard key={event.id} res={event} type="in" />)}</div>
              </div>
            </div>
            <div className="mt-14 pt-8 border-t border-gray-200 dark:border-slate-800 flex justify-end">
               <button onClick={() => setSelectedDayInfo(null)} className="px-16 py-7 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
