
import React, { useState, useRef } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  ArrowRight,
  Info,
  Tag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Property } from '../types';
import { useNavigate } from 'react-router-dom';

const PropertiesPage: React.FC = () => {
  const { properties, addProperty, deleteProperty } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: '',
    internalName: '',
    address: '',
    type: 'whole',
    imageUrl: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.internalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newProperty.name || !newProperty.address) return;
    addProperty(newProperty as Omit<Property, 'id' | 'icalLinks'>);
    setShowModal(false);
    setNewProperty({ name: '', internalName: '', address: '', type: 'whole', imageUrl: '', description: '' });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el anuncio "${name}"? Se borrarán también todas sus reservas.`)) {
      deleteProperty(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Mis Anuncios</h2>
          <p className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Gestión de Unidades de Alojamiento</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          Nuevo Anuncio
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar propiedad por nombre o dirección..."
          className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white rounded-[2rem] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.map((p) => (
          <div 
            key={p.id}
            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-2xl transition-all overflow-hidden relative flex flex-col"
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src={p.imageUrl || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=500&auto=format&fit=crop'} 
                alt={p.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                 <button 
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="p-3 bg-white/90 backdrop-blur-md text-blue-600 rounded-2xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                 >
                   <Edit3 size={18} />
                 </button>
                 <button 
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-3 bg-white/90 backdrop-blur-md text-red-600 rounded-2xl shadow-lg hover:bg-red-600 hover:text-white transition-all"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
              <div className="absolute bottom-4 left-4">
                 <span className="px-4 py-1.5 bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                   {p.type === 'whole' ? 'Vivienda Completa' : 'Habitación'}
                 </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col text-left">
              <div className="mb-2">
                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                  {p.internalName || p.name}
                </h4>
                {p.internalName && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.name}</p>
                )}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <MapPin size={14} className="text-blue-500" /> {p.address}
              </p>
              
              <div className="mt-auto pt-6 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">?</div>
                   ))}
                </div>
                <button 
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all active:scale-95"
                >
                  Ver Detalles <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowModal(true)}
          className="border-4 border-dashed border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 hover:border-blue-500 hover:bg-blue-50/20 transition-all group min-h-[400px]"
        >
          <div className="p-8 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
            <Plus size={48} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Añadir Anuncio</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Registra una nueva propiedad</p>
          </div>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl"><Building size={24}/></div>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Nuevo Anuncio</h4>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Foto de Portada</label>
                <div className="relative group">
                  <div className="w-full h-48 rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-50 dark:border-slate-700 flex flex-col items-center justify-center text-gray-300">
                    {newProperty.imageUrl ? (
                      <img src={newProperty.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={48} />
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 p-4 bg-white text-gray-900 rounded-2xl shadow-xl hover:scale-110 transition-all">
                    <Upload size={20} />
                  </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setNewProperty({...newProperty, imageUrl: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic flex items-center gap-1">
                    <Tag size={12}/> Nombre Interno (Gestión)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Casa Centro" 
                    className="w-full p-5 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-transparent focus:border-blue-500 rounded-3xl font-black uppercase text-xs transition-all outline-none"
                    value={newProperty.internalName}
                    onChange={e => setNewProperty({...newProperty, internalName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Título Comercial</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Apartamento Puerto Sol" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none"
                    value={newProperty.name}
                    onChange={e => setNewProperty({...newProperty, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Tipo</label>
                  <select 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-black uppercase text-xs outline-none appearance-none"
                    value={newProperty.type}
                    onChange={e => setNewProperty({...newProperty, type: e.target.value as any})}
                  >
                    <option value="whole">Vivienda Completa</option>
                    <option value="room">Habitación Privada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Sincronización</label>
                  <div className="w-full p-5 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-3xl font-black uppercase text-[10px] flex items-center gap-2">
                    <Info size={14} /> Airbnb / Booking
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Dirección Exacta</label>
                <input 
                  type="text" 
                  placeholder="Calle, Número, Ciudad..." 
                  className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none"
                  value={newProperty.address}
                  onChange={e => setNewProperty({...newProperty, address: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-6 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <Save size={20} /> Crear Propiedad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
