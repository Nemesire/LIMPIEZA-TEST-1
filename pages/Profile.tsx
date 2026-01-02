
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Shield, 
  Settings, 
  HelpCircle, 
  LogOut, 
  MapPin, 
  Edit2, 
  Camera, 
  Save, 
  X,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, updateProfile, logout } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(currentProfile || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentProfile) return null;

  const handleLogoutAction = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSave = () => {
    updateProfile({ ...currentProfile, ...formData } as User);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="text-center relative">
        <div className="relative w-32 h-32 mx-auto mb-6 group">
          <div className="w-full h-full bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl text-white font-black italic border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              formData.name?.[0] || '?'
            )}
          </div>
          
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-slate-900"
            >
              <Camera size={20} />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        {!isEditing ? (
          <>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{currentProfile.name}</h2>
            <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">{currentProfile.role}</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-6 px-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
            >
              <Edit2 size={16} /> Editar Perfil
            </button>
          </>
        ) : (
          <div className="space-y-4 max-w-sm mx-auto">
            <input 
              type="text" 
              placeholder="Nombre Completo"
              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-slate-800 rounded-2xl font-black uppercase italic text-center outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                <Save size={16} /> Guardar
              </button>
              <button 
                onClick={() => { setIsEditing(false); setFormData(currentProfile); }}
                className="px-6 py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-2xl font-black uppercase text-[10px]"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden text-left">
        {[
          { 
            icon: Mail, 
            label: 'Email de Contacto', 
            value: currentProfile.email,
            key: 'email',
            type: 'email'
          },
          { 
            icon: Phone, 
            label: 'Teléfono Móvil', 
            value: currentProfile.phone || 'Sin especificar',
            key: 'phone',
            type: 'tel'
          },
          { 
            icon: MapPin, 
            label: 'Dirección de Trabajo', 
            value: currentProfile.address || 'Sin especificar',
            key: 'address',
            type: 'text'
          },
          { 
            icon: Shield, 
            label: 'Permisos de Sistema', 
            value: `Nivel ${currentProfile.role === 'CLEANER' ? 'Operativo (Limpieza)' : 'Administrativo (Host)'}`,
            isReadonly: true
          },
        ].map((item, i) => (
          <div key={i} className={`p-8 flex items-center gap-6 ${i !== 3 ? 'border-b border-gray-50 dark:border-slate-800/50' : ''}`}>
            <div className={`p-4 rounded-2xl shadow-sm ${item.isReadonly ? 'bg-gray-50 dark:bg-slate-800 text-gray-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
              {isEditing && !item.isReadonly ? (
                <input 
                  type={item.type}
                  className="w-full bg-transparent border-b-2 border-blue-100 dark:border-slate-800 font-bold text-gray-900 dark:text-slate-200 outline-none focus:border-blue-600 transition-colors py-1"
                  value={(formData as any)[item.key!] || ''}
                  onChange={e => setFormData({...formData, [item.key!]: e.target.value})}
                />
              ) : (
                <p className={`font-black uppercase italic ${item.isReadonly ? 'text-gray-400' : 'text-gray-900 dark:text-slate-200'}`}>{item.value}</p>
              )}
            </div>
            {item.isReadonly && <CheckCircle2 size={18} className="text-gray-200 dark:text-slate-800" />}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {!isEditing && (
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:rotate-12 transition-transform">
                <Settings size={22} />
              </div>
              <span className="font-black text-gray-700 dark:text-slate-300 uppercase text-[10px] tracking-widest">Ajustes Maestro de Perfiles</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:translate-x-1 transition-transform">
              <Shield size={16} />
            </div>
          </button>
        )}
        
        <button 
          onClick={handleLogoutAction}
          className="w-full flex items-center justify-center gap-4 p-7 bg-red-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-100 dark:shadow-none hover:bg-red-700 hover:scale-[1.02] transition-all active:scale-95"
        >
          <LogOut size={24} />
          <span className="text-xs">Cerrar Sesión del Dispositivo</span>
        </button>
      </div>

      <div className="text-center py-10">
        <p className="text-[10px] text-gray-300 dark:text-slate-700 font-black uppercase tracking-[0.5em] italic">
          LimpiaBnB Logística v1.3.5
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
