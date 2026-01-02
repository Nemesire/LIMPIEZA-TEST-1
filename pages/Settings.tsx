
import React, { useRef, useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  HardDrive,
  Copy,
  ClipboardPaste,
  CheckCircle2,
  X,
  Users,
  Edit2,
  UserPlus,
  ArrowLeft,
  CalendarX,
  FileSpreadsheet,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Calendar,
  Image as ImageIcon,
  Camera,
  Mail,
  Phone,
  MapPin,
  Settings as SettingsIcon,
  AlignLeft,
  FileText,
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { User, UserRole } from '../types';
import { geminiService } from '../services/geminiService';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { 
    exportData, 
    importData, 
    importCSV,
    getBackupString, 
    importDataFromString, 
    resetData,
    clearReservations,
    profiles,
    currentProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    properties,
    addBulkReservations
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<User> | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Backup Manual Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // AI Import State within Settings
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) alert('¡Éxito! Base de datos restaurada correctamente.');
      else alert('Error: El archivo no es un backup válido de LimpiaBnB.');
      e.target.value = '';
    }
  };

  const handleCopyBackup = () => {
    try {
      const data = getBackupString();
      // Usamos un textarea temporal para asegurar compatibilidad en móviles si navigator falla
      const textArea = document.createElement("textarea");
      textArea.value = data;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        alert("No se pudo copiar automáticamente. Intenta exportar el archivo JSON.");
      }
      document.body.removeChild(textArea);
    } catch (err) {
      alert("Error al generar backup.");
    }
  };

  const handleManualImport = async () => {
    if (!importText.trim()) return;
    const success = await importDataFromString(importText);
    if (success) {
      setShowImportModal(false);
      setImportText('');
      // No hace falta alert porque StoreContext recarga la página al éxito
    } else {
      alert('Error: El texto pegado no tiene un formato de backup válido.');
    }
  };

  const handleCSVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importCSV(file);
      if (result.success) alert(`¡Éxito! Se han importado ${result.count} reservas del archivo CSV.`);
      else alert('Error: No se detectó el formato de Airbnb en el CSV.');
      e.target.value = '';
    }
  };

  // AI Logic for Settings
  const processImageForAi = async (base64: string) => {
    setIsAiProcessing(true);
    setAiError(null);
    try {
      const propertyNames = properties.map(p => p.name);
      const results = await geminiService.parseReservationsFromImage(base64, propertyNames);
      if (!Array.isArray(results) || results.length === 0) throw new Error("No se detectaron reservas.");
      
      const mappedResults = results.map((res: any) => {
        const foundProp = properties.find(p => p.name.toLowerCase().includes(res.propertyName?.toLowerCase()) || res.propertyName?.toLowerCase().includes(p.name.toLowerCase()));
        return { 
          ...res,
          propertyId: foundProp?.id || (properties.length > 0 ? properties[0].id : 'manual'),
          propertyName: foundProp?.name || res.propertyName
        };
      });
      setExtractedData(mappedResults);
    } catch (err: any) {
      setAiError(err.message || "Error al procesar la imagen.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onloadend = () => processImageForAi(reader.result as string);
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      setAiError("No hay una imagen en el portapapeles. Haz la captura primero.");
    } catch (err) {
      setAiError("Error al acceder al portapapeles.");
    }
  };

  const confirmAiImport = () => {
    if (extractedData) {
      addBulkReservations(extractedData);
      setShowAiModal(false);
      setExtractedData(null);
      alert('Reservas cargadas al calendario mediante IA.');
    }
  };

  const openAddProfile = () => {
    setEditingProfile({ 
      name: '', 
      email: '', 
      role: UserRole.CLEANER, 
      phone: '', 
      address: '', 
      preferences: '', 
      photoUrl: '' 
    });
    setShowProfileModal(true);
  };

  const handleEditProfile = (profile: User) => {
    setEditingProfile(profile);
    setShowProfileModal(true);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingProfile) setEditingProfile({ ...editingProfile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!editingProfile) return;
    
    const hasAnyData = (editingProfile.name?.trim()) || 
                       (editingProfile.email?.trim()) || 
                       (editingProfile.phone?.trim()) || 
                       (editingProfile.address?.trim()) || 
                       (editingProfile.preferences?.trim()) || 
                       (editingProfile.photoUrl);

    if (!hasAnyData) {
      alert("Por favor, introduce al menos un dato para crear el perfil.");
      return;
    }

    const finalProfile = {
      ...editingProfile,
      name: editingProfile.name?.trim() || "Perfil Sin Nombre",
      email: editingProfile.email?.trim() || "contacto@limpiabnb.app",
      role: editingProfile.role || UserRole.CLEANER
    };

    if (editingProfile.id) {
      updateProfile(finalProfile as User);
    } else {
      addProfile(finalProfile as Omit<User, 'id'>);
    }
    
    setShowProfileModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 text-left">
      <header>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Centro de Control</h2>
        <p className="text-gray-500 dark:text-slate-400 font-medium italic">Configuración maestra, respaldos e importación inteligente.</p>
      </header>

      {/* SECCIÓN 1: PERFILES */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-purple-50/30 dark:bg-purple-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-purple-600 dark:text-purple-400" size={24} />
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Perfiles de Acceso</h3>
          </div>
          <button onClick={openAddProfile} className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg active:scale-95">
            <UserPlus size={18} className="inline mr-2" /> Nuevo Perfil
          </button>
        </div>
        <div className="p-8 space-y-3">
          {profiles.length > 0 ? (
            profiles.map(profile => (
              <div key={profile.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${currentProfile?.id === profile.id ? 'bg-purple-50/50 border-purple-200' : 'border-gray-50 dark:border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black italic text-lg uppercase overflow-hidden">
                    {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" /> : (profile.name?.[0] || '?')}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white uppercase italic text-sm">{profile.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{profile.role} • {profile.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => selectProfile(profile.id)} className={`p-2 rounded-lg ${currentProfile?.id === profile.id ? 'text-purple-600 bg-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}><CheckCircle2 size={18} /></button>
                  <button onClick={() => handleEditProfile(profile)} className="p-2 text-gray-400 hover:text-blue-500"><Edit2 size={18} /></button>
                  <button onClick={() => deleteProfile(profile.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest italic">No hay perfiles configurados</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECCIÓN 2: COPIA DE SEGURIDAD (BACKUP) - MEJORADO */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10 flex items-center gap-3">
            <Database className="text-blue-600 dark:text-blue-400" size={24} />
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Backup del Sistema</h3>
          </div>
          <div className="p-8 flex-1 space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Respalda o restaura todo el sistema (Propiedades, Inventario, Perfiles y Reservas).</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={exportData} className="flex flex-col items-center justify-center p-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95 gap-2">
                  <Download size={20} /> Exportar JSON
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-blue-400 transition-all gap-2">
                  <Upload size={20} /> Importar JSON
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleCopyBackup} className="flex flex-col items-center justify-center p-5 bg-gray-900 dark:bg-slate-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 gap-2 relative overflow-hidden">
                  <Copy size={20} /> {copyFeedback ? '¡Copiado!' : 'Copiar Texto'}
                  {copyFeedback && <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200"><CheckCircle2 size={24}/></div>}
                </button>
                <button onClick={() => setShowImportModal(true)} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-gray-400 transition-all gap-2">
                  <ClipboardPaste size={20} /> Pegar Texto
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: IMPORTACIÓN LOGÍSTICA (CSV / IA) */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10 flex items-center gap-3">
            <Sparkles className="text-emerald-600 dark:text-emerald-400" size={24} />
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Importación de Reservas</h3>
          </div>
          <div className="p-8 flex-1 space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Añade reservas nuevas a tu calendario mediante archivos externos o escaneo inteligente.</p>
            <div className="space-y-3">
              <button onClick={() => csvInputRef.current?.click()} className="w-full flex items-center justify-between p-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
                <div className="flex items-center gap-3"><FileSpreadsheet size={20} /> Cargar CSV Airbnb</div>
                <ArrowRight size={16} />
              </button>
              <button onClick={() => setShowAiModal(true)} className="w-full flex items-center justify-between p-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3"><Sparkles size={20} className="text-blue-400" /> Escanear con IA</div>
                <div className="px-2 py-0.5 bg-blue-500 text-white text-[8px] rounded-md animate-pulse">PRO</div>
              </button>
              <input type="file" ref={csvInputRef} onChange={handleCSVChange} className="hidden" accept=".csv" />
            </div>
          </div>
        </section>
      </div>

      {/* SECCIÓN 4: MANTENIMIENTO */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden border-b-8 border-b-red-600">
        <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex items-center gap-3">
          <ShieldAlert className="text-red-600" size={24} />
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Zona de Peligro</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => clearReservations()} 
            className="flex flex-col items-center justify-center gap-2 p-6 bg-red-50 text-red-600 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm group"
          >
            <CalendarX size={24} className="group-hover:scale-110 transition-transform" /> 
            Vaciar Reservas
          </button>
          <button 
            onClick={() => resetData()} 
            className="flex flex-col items-center justify-center gap-2 p-6 border-4 border-red-50 text-red-600 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:border-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm group"
          >
            <Trash2 size={24} className="group-hover:scale-110 transition-transform" /> 
            Restablecer App
          </button>
        </div>
      </section>

      {/* MODAL DE IMPORTACIÓN MANUAL (INFALIBLE) */}
      {showImportModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Terminal className="text-blue-600" size={24} />
                <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Pegado Manual</h4>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-red-500"><X size={32} /></button>
            </div>
            
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pega aquí el código de backup copiado de otro dispositivo:</p>
              <textarea 
                className="w-full h-64 p-6 bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-3xl font-mono text-[10px] text-gray-600 dark:text-gray-300 outline-none focus:border-blue-500 transition-all resize-none"
                placeholder='{"properties": [...], "profiles": [...] }'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowImportModal(false)}
                  className="py-5 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleManualImport}
                  className="py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Restaurar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLADO DE PERFIL */}
      {showProfileModal && editingProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[92vh] border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-4xl font-black uppercase italic text-gray-900 dark:text-white tracking-tighter">Ficha de Perfil</h4>
              <button onClick={() => setShowProfileModal(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            
            <div className="space-y-6 text-left">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 group">
                  <div className="w-full h-full bg-blue-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-blue-600 italic border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                    {editingProfile.photoUrl ? <img src={editingProfile.photoUrl} className="w-full h-full object-cover" /> : (editingProfile.name?.[0] || '?')}
                  </div>
                  <button onClick={() => profilePhotoRef.current?.click()} className="absolute -bottom-2 -right-2 p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white dark:border-slate-900">
                    <Camera size={20} />
                  </button>
                  <input type="file" ref={profilePhotoRef} className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                </div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic bg-gray-100 px-4 py-1 rounded-full">Avatar del Perfil</p>
              </div>

              {/* Campos del Formulario */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre y Apellidos</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="text" placeholder="Ej: Juan Pérez" className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none" value={editingProfile.name} onChange={e => setEditingProfile({...editingProfile, name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="email" placeholder="email@dominio.com" className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none" value={editingProfile.email} onChange={e => setEditingProfile({...editingProfile, email: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Teléfono de Contacto</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input type="tel" placeholder="+34..." className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none" value={editingProfile.phone} onChange={e => setEditingProfile({...editingProfile, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nivel de Acceso</label>
                    <div className="relative">
                      <SettingsIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <select className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-black uppercase text-xs outline-none appearance-none" value={editingProfile.role} onChange={e => setEditingProfile({...editingProfile, role: e.target.value as UserRole})}>
                        <option value={UserRole.CLEANER}>Operativo Limpieza</option>
                        <option value={UserRole.HOST}>Administrador Host</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Dirección / Base de Operaciones</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input type="text" placeholder="Calle, Número, Localidad" className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none" value={editingProfile.address} onChange={e => setEditingProfile({...editingProfile, address: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Preferencias y Notas</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-6 text-gray-300" size={18} />
                    <textarea placeholder="Ej: Disponibilidad horaria, alergias, notas internas..." rows={3} className="w-full pl-12 p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none resize-none" value={editingProfile.preferences} onChange={e => setEditingProfile({...editingProfile, preferences: e.target.value})} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveProfile} 
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <Save size={24} /> Guardar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI MODAL INTEGRADO */}
      {showAiModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                  <Sparkles className="text-blue-600" /> Escaneo Logístico IA
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extrae reservas pegando la imagen o subiendo una captura</p>
              </div>
              <button onClick={() => { setShowAiModal(false); setExtractedData(null); setAiError(null); }} className="text-gray-400 hover:text-red-500"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {!extractedData && !isAiProcessing && (
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={handleAiPaste} className="w-full flex items-center justify-between p-8 bg-gray-50 dark:bg-slate-800 border-4 border-dashed border-gray-200 dark:border-slate-700 rounded-[2rem] hover:border-blue-500 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><ClipboardPaste size={32} /></div>
                      <div className="text-left">
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Pegar Captura</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pulsa aquí si tienes la imagen copiada</p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => aiFileInputRef.current?.click()} className="w-full flex items-center justify-between p-8 bg-gray-50 dark:bg-slate-800 border-4 border-dashed border-gray-200 dark:border-slate-700 rounded-[2rem] hover:border-emerald-500 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl text-emerald-600 shadow-sm group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                      <div className="text-left">
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Subir Archivo</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Selecciona una imagen de tu dispositivo</p>
                      </div>
                    </div>
                  </button>
                  <input type="file" ref={aiFileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => processImageForAi(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              )}

              {isAiProcessing && (
                <div className="p-20 flex flex-col items-center justify-center gap-6 text-center">
                  <RefreshCw size={64} className="text-blue-600 animate-spin" />
                  <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Analizando imagen con Gemini...</p>
                </div>
              )}

              {aiError && (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-4">
                  <AlertCircle size={24} />
                  <p className="text-xs font-black uppercase italic">{aiError}</p>
                </div>
              )}

              {extractedData && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b pb-2">Resultados ({extractedData.length})</p>
                  <div className="space-y-2">
                    {extractedData.map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase text-gray-900 dark:text-white">{item.guestName}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">{item.propertyName} • {item.checkIn} / {item.checkOut}</p>
                        </div>
                        <div className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">OK</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={confirmAiImport} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl">Confirmar Importación</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
