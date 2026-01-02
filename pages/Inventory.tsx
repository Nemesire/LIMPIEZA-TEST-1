
import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  AlertTriangle, 
  ShoppingCart, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  CheckCircle2,
  Package,
  ArrowRight
} from 'lucide-react';
import { InventoryItem } from '../types';
import { useStore } from '../context/StoreContext';

const InventoryPage: React.FC = () => {
  const { inventory, updateInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  const openAddModal = () => {
    setEditingItem({
      name: '',
      category: 'consumable',
      stock: 0,
      minStock: 2,
      unit: 'unidades'
    });
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    // Eliminación directa sin advertencia como solicitado
    deleteInventoryItem(id);
  };

  const handleSave = () => {
    if (!editingItem || !editingItem.name) return;

    if (editingItem.id) {
      updateInventoryItem(editingItem as InventoryItem);
    } else {
      addInventoryItem(editingItem as Omit<InventoryItem, 'id'>);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Control de Suministros</h2>
          <p className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Gestión de Stock Crítico y Reposición</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </header>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 p-6 rounded-[2.5rem] flex items-center justify-between gap-4 shadow-xl shadow-amber-50 dark:shadow-none animate-pulse">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <AlertTriangle size={32} />
            </div>
            <div className="text-left">
              <h4 className="text-xl font-black text-amber-900 dark:text-amber-200 uppercase italic">Stock Crítico Detectado</h4>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400/80 uppercase tracking-widest">Hay {lowStockItems.length} productos bajo el nivel mínimo de seguridad.</p>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">
            <ShoppingCart size={16} /> Generar Pedido
          </button>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar en el almacén..."
            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white rounded-[2rem] font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-5 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-[1.5rem] text-gray-400 hover:text-blue-600 transition-all shadow-sm active:scale-90">
          <Filter size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLow = item.stock <= item.minStock;
          return (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 shadow-sm transition-all group relative overflow-hidden ${
                isLow 
                ? 'border-amber-200 dark:border-amber-800 bg-amber-50/10 dark:bg-amber-900/5 shadow-xl shadow-amber-50 dark:shadow-none' 
                : 'border-gray-100 dark:border-slate-800 hover:border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-3 inline-block transition-colors ${isLow ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700'}`}>
                    {item.category}
                  </span>
                  <h4 className="font-black text-2xl text-gray-900 dark:text-white uppercase italic leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => openEditModal(item)}
                    className="p-3 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-blue-200"
                    title="Editar producto"
                   >
                     <Edit3 size={18} />
                   </button>
                   <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-red-200"
                    title="Eliminar producto"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className={`text-4xl font-black flex items-baseline gap-2 italic ${isLow ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                  {item.stock} <span className="text-xs font-black uppercase tracking-widest text-gray-400 not-italic">{item.unit}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateInventory(item.id, -1)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-all active:scale-90"
                  >
                    <Minus size={22} />
                  </button>
                  <button 
                    onClick={() => updateInventory(item.id, 1)}
                    className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-90"
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-gray-200/20">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (item.stock / (item.minStock * 2)) * 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-3 px-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Mínimo: {item.minStock} {item.unit}</p>
                 {isLow && (
                   <span className="flex items-center gap-1 text-amber-600 text-[10px] font-black uppercase italic animate-pulse">
                     <AlertTriangle size={12} /> Reponer
                   </span>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && editingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-left border-8 border-white dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl"><Package size={24}/></div>
                <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                  {editingItem.id ? 'Editar Producto' : 'Nuevo Suministro'}
                </h4>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Nombre del Producto</label>
                <input 
                  type="text" 
                  placeholder="Ej: Papel Higiénico Premium" 
                  className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none"
                  value={editingItem.name}
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Categoría</label>
                  <select 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-black uppercase text-xs outline-none appearance-none"
                    value={editingItem.category}
                    onChange={e => setEditingItem({...editingItem, category: e.target.value as any})}
                  >
                    <option value="cleaning">Limpieza</option>
                    <option value="consumable">Consumible</option>
                    <option value="linen">Lencería / Ropa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Unidad de Medida</label>
                  <input 
                    type="text" 
                    placeholder="Ej: litros, rollos, cápsulas" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-bold transition-all outline-none"
                    value={editingItem.unit}
                    onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Stock Actual</label>
                  <input 
                    type="number" 
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-3xl font-black text-2xl outline-none"
                    value={editingItem.stock}
                    onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest italic">Mínimo de Alerta</label>
                  <input 
                    type="number" 
                    className="w-full p-5 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800/30 text-amber-600 focus:border-amber-500 rounded-3xl font-black text-2xl outline-none"
                    value={editingItem.minStock}
                    onChange={e => setEditingItem({...editingItem, minStock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-6 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-blue-700"
                >
                  <Save size={20} /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
