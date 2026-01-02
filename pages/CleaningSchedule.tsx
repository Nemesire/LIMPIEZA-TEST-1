
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  MapPin, 
  ExternalLink,
  Info,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Users,
  Undo2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { notificationService } from '../services/notificationService';

const CleaningSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, properties, updateReservation } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const tasks = useMemo(() => {
    return reservations
      .filter(res => res.checkOut === dateStr)
      .map(res => {
        const checkInToday = reservations.find(r => r.propertyId === res.propertyId && r.checkIn === dateStr);
        return {
          ...res,
          isTurnover: !!checkInToday,
          nextGuestName: checkInToday?.guestName,
          nextGuestTime: checkInToday?.checkInTime || '14:00',
          nextGuestCount: checkInToday?.guestCount || 0,
          property: properties.find(p => p.id === res.propertyId)
        };
      });
  }, [reservations, properties, dateStr]);

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const toggleStatus = (reservationId: string, currentStatus: string, propertyName: string) => {
    const isNowCompleted = currentStatus !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'upcoming';
    updateReservation(reservationId, { status: newStatus });
    if (isNowCompleted) {
      notificationService.send({
        title: 'Limpieza Finalizada',
        message: `La propiedad "${propertyName}" ya está lista para el siguiente huésped.`,
        type: 'cleaning'
      });
    }
  };

  const formattedDateDisplay = selectedDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12 text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Agenda de Limpieza</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium italic">Gestión de tiempos y rotaciones críticas.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1 border border-gray-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setSelectedDate(new Date())}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedDate.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            Hoy
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-3 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft /></button>
        <div className="flex items-center gap-3 font-black text-xl text-gray-900 dark:text-white uppercase italic tracking-tighter">
          <CalendarIcon size={24} className="text-blue-600" />
          {formattedDateDisplay}
        </div>
        <button onClick={() => changeDate(1)} className="p-3 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronRight /></button>
      </div>

      <div className="space-y-6">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const displayPropName = task.property?.internalName || task.property?.name || 'Propiedad desconocida';
            
            return (
              <div 
                key={task.id} 
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 transition-all group p-8 relative overflow-hidden ${
                  isCompleted 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : task.isTurnover 
                    ? 'border-red-500 shadow-2xl shadow-red-100 dark:shadow-none bg-red-50/20' 
                    : 'border-gray-100 dark:border-slate-800 shadow-sm'
                }`}
              >
                {isCompleted ? (
                   <div className="absolute top-0 right-0">
                    <button 
                      onClick={() => toggleStatus(task.id, task.status, displayPropName)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 font-black uppercase italic text-[10px] tracking-widest rounded-bl-3xl flex items-center gap-2 shadow-lg transition-colors group/ready"
                    >
                      <CheckCircle size={14} className="group-hover/ready:hidden" />
                      <Undo2 size={14} className="hidden group-hover/ready:block" />
                      <span className="group-hover/ready:hidden">Propiedad Lista</span>
                      <span className="hidden group-hover/ready:block">Deshacer</span>
                    </button>
                  </div>
                ) : task.isTurnover && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white px-8 py-2 font-black uppercase italic text-[10px] tracking-widest rounded-bl-3xl flex items-center gap-2 shadow-lg">
                      <RefreshCw size={14} className="animate-spin" /> Rotación Crítica
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex gap-6 flex-1">
                    <div className={`w-24 h-24 rounded-[2rem] overflow-hidden hidden sm:block shadow-xl border-4 ${isCompleted ? 'border-emerald-500' : task.isTurnover ? 'border-red-500' : 'border-white dark:border-slate-800'}`}>
                      <img src={task.property?.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-black text-3xl uppercase italic tracking-tighter leading-none transition-colors ${isCompleted ? 'text-emerald-600' : task.isTurnover ? 'text-red-600' : 'text-gray-900 dark:text-white group-hover:text-blue-600'}`}>
                          {displayPropName}
                        </h4>
                        <button onClick={() => navigate(`/property/${task.propertyId}`)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors"><ExternalLink size={20}/></button>
                      </div>
                      {task.property?.internalName && (
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">{task.property.name}</p>
                      )}
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 mb-4 flex items-center gap-1"><MapPin size={12}/> {task.property?.address}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-red-600 ml-1 italic tracking-widest">Horario Salida</span>
                          <span className="px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl flex items-center gap-2 uppercase tracking-widest border-2 border-red-100 dark:border-red-900/30">
                            <Clock size={16} /> {task.checkOutTime || '11:00'}
                          </span>
                        </div>
                        {task.isTurnover && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase text-emerald-600 ml-1 italic tracking-widest">Horario Entrada</span>
                            <span className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-2xl flex items-center gap-2 uppercase tracking-widest border-2 border-emerald-100 dark:border-emerald-900/30">
                              <AlertTriangle size={16} /> {task.nextGuestTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleStatus(task.id, task.status, displayPropName)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                        isCompleted ? 'bg-emerald-600 text-white' : task.isTurnover ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      <CheckCircle size={22} /> {isCompleted ? 'LISTO' : 'Completar'}
                    </button>
                    <button className="p-5 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-2xl hover:text-blue-600 transition-colors border border-gray-200 dark:border-slate-700 active:scale-90"><Camera size={24} /></button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-gray-200 dark:border-slate-800">
             <AlertCircle size={64} className="mx-auto mb-6 text-gray-300" />
             <p className="text-2xl font-black text-gray-400 uppercase tracking-tighter italic">No hay limpiezas programadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningSchedule;
