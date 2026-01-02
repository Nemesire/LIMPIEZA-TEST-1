
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Reservation, ICalLink, UserRole, InventoryItem, User } from '../types';
import { INITIAL_PROPERTIES, MOCK_RESERVATIONS, INITIAL_INVENTORY } from '../constants';
import { icalService } from '../services/icalService';
import { notificationService } from '../services/notificationService';

interface StoreContextType {
  properties: Property[];
  reservations: Reservation[];
  inventory: InventoryItem[];
  profiles: User[];
  currentProfile: User | null;
  currentProfileId: string | null;
  addICalLink: (propertyId: string, label: string, url: string) => Promise<void>;
  removeICalLink: (propertyId: string, linkId: string) => void;
  updateInventory: (id: string, delta: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  syncAll: () => Promise<void>;
  addBulkReservations: (newReservations: Partial<Reservation>[]) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  exportData: () => void;
  getBackupString: () => string;
  importData: (file: File) => Promise<boolean>;
  importCSV: (file: File) => Promise<{ success: boolean; count: number; type: string }>;
  importDataFromString: (jsonString: string) => Promise<boolean>;
  resetData: () => void;
  clearReservations: (propertyId?: string) => void;
  addProfile: (profile: Omit<User, 'id'>) => void;
  updateProfile: (profile: User) => void;
  deleteProfile: (id: string) => void;
  selectProfile: (id: string) => void;
  addProperty: (property: Omit<Property, 'id' | 'icalLinks'>) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('limpiabnb_properties');
    if (!saved) return INITIAL_PROPERTIES;
    try {
      const parsed = JSON.parse(saved);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_PROPERTIES;
    } catch { return INITIAL_PROPERTIES; }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('limpiabnb_reservations');
    if (saved === null) return MOCK_RESERVATIONS.map(r => ({ ...r, icalLinkId: 'manual' } as Reservation));
    try { return JSON.parse(saved); } catch { return []; }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('limpiabnb_inventory');
    if (saved === null) return INITIAL_INVENTORY;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_INVENTORY;
    } catch { return INITIAL_INVENTORY; }
  });

  const [profiles, setProfiles] = useState<User[]>(() => {
    const saved = localStorage.getItem('limpiabnb_profiles');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [currentProfileId, setCurrentProfileId] = useState<string | null>(() => {
    return localStorage.getItem('limpiabnb_current_profile_id');
  });

  const [isLoading, setIsLoading] = useState(false);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || null;

  useEffect(() => { localStorage.setItem('limpiabnb_properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('limpiabnb_reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { localStorage.setItem('limpiabnb_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('limpiabnb_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => {
    if (currentProfileId) localStorage.setItem('limpiabnb_current_profile_id', currentProfileId);
    else localStorage.removeItem('limpiabnb_current_profile_id');
  }, [currentProfileId]);

  const logout = useCallback(() => setCurrentProfileId(null), []);
  const selectProfile = useCallback((id: string) => setCurrentProfileId(id), []);

  const addICalLink = async (propertyId: string, label: string, url: string) => {
    setIsLoading(true);
    const linkId = Date.now().toString();
    const newLink: ICalLink = { id: linkId, label, url, lastSynced: new Date().toISOString() };
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, icalLinks: [...p.icalLinks, newLink] } : p));
    try {
      const newRes = await icalService.syncLink(propertyId, newLink);
      if (newRes.length > 0) {
        setReservations(prev => {
          const filtered = prev.filter(r => r.icalLinkId !== linkId);
          return [...filtered, ...newRes];
        });
      }
    } finally { setIsLoading(false); }
  };

  const addBulkReservations = (newItems: Partial<Reservation>[]) => {
    const processed = newItems.map(item => ({
      ...item,
      id: item.id || `csv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      icalLinkId: item.icalLinkId || 'manual',
      status: item.status || 'upcoming' as const,
      checkInTime: item.checkInTime || '14:00',
      checkOutTime: item.checkOutTime || '11:00'
    })) as Reservation[];
    
    setReservations(prev => {
      const codesToUpdate = new Set(processed.map(p => p.reservationCode).filter(Boolean));
      const filtered = prev.filter(r => !r.reservationCode || !codesToUpdate.has(r.reservationCode));
      return [...filtered, ...processed];
    });
    notificationService.send({ title: 'Sincronización Completa', message: `Se han actualizado ${processed.length} registros en el calendario.`, type: 'reservation' });
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    notificationService.send({ title: 'Reserva Eliminada', message: 'El registro ha sido borrado del sistema.', type: 'system' });
  };

  const removeICalLink = (propertyId: string, linkId: string) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, icalLinks: p.icalLinks.filter(l => l.id !== linkId) } : p));
    setReservations(prev => prev.filter(r => r.icalLinkId !== linkId));
  };

  const updateInventory = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setInventory(prev => [...prev, newItem]);
    notificationService.send({ title: 'Producto Añadido', message: `${newItem.name} ha sido registrado en el inventario.`, type: 'stock' });
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    notificationService.send({ title: 'Producto Eliminado', message: 'El producto ha sido borrado del inventario permanentemente.', type: 'stock' });
  };

  const syncAll = async () => {
    if (isLoading || !currentProfileId) return;
    setIsLoading(true);
    try {
      let allNewReservations: Reservation[] = [];
      const linksToSync = properties.flatMap(p => p.icalLinks.map(l => ({ propertyId: p.id, link: l })));
      if (linksToSync.length === 0) return;
      for (const item of linksToSync) {
        try {
          const synced = await icalService.syncLink(item.propertyId, item.link);
          allNewReservations = [...allNewReservations, ...synced];
        } catch (e) { console.error(e); }
      }
      if (allNewReservations.length > 0) {
        setReservations(prev => {
          const manualOnly = prev.filter(r => r.icalLinkId === 'manual');
          return [...manualOnly, ...allNewReservations];
        });
      }
    } finally { setIsLoading(false); }
  };

  const clearReservations = useCallback((propertyId?: string) => {
    setReservations(prev => {
      const nextReservations = propertyId ? prev.filter(r => r.propertyId !== propertyId) : [];
      localStorage.setItem('limpiabnb_reservations', JSON.stringify(nextReservations));
      return nextReservations;
    });
    notificationService.send({ title: 'Limpieza de Agenda', message: 'Se han borrado las reservas del calendario.', type: 'system' });
  }, []);

  const addProperty = (propertyData: Omit<Property, 'id' | 'icalLinks'>) => {
    const newProperty: Property = {
      ...propertyData,
      id: `p-${Date.now()}`,
      icalLinks: []
    };
    setProperties(prev => [...prev, newProperty]);
    notificationService.send({ title: 'Nuevo Anuncio', message: `La propiedad "${newProperty.name}" ha sido creada con éxito.`, type: 'system' });
  };

  const updateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    setReservations(prev => prev.filter(r => r.propertyId !== id));
    notificationService.send({ title: 'Anuncio Eliminado', message: 'La propiedad y todas sus reservas han sido borradas.', type: 'system' });
  };

  const getBackupString = () => JSON.stringify({ 
    properties, 
    reservations, 
    inventory, 
    profiles, 
    currentProfileId 
  }, null, 2);

  const exportData = () => {
    const data = getBackupString();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `limpiabnb_backup.json`;
    link.click();
  };

  const importCSV = async (file: File): Promise<{ success: boolean; count: number; type: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
          if (rawLines.length < 2) return resolve({ success: false, count: 0, type: '' });
          
          const firstLine = rawLines[0].replace(/^\uFEFF/, '');
          const delimiter = [',', ';', '\t'].reduce((prev, curr) => (firstLine.split(curr).length > firstLine.split(prev).length) ? curr : prev);
          
          const normalize = (s: string) => 
            s.toLowerCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
             .replace(/[^a-z0-9\s]/g, " ")
             .replace(/\s+/g, " ")
             .trim();

          const headers = firstLine.split(delimiter).map(h => normalize(h.trim()));
          
          const codeIdx = headers.findIndex(h => h.includes('codigo') || h.includes('confirmation') || h.includes('conf'));
          const propIdx = headers.findIndex(h => h.includes('anuncio') || h.includes('listing') || h.includes('propiedad') || h.includes('habitacion'));
          const guestIdx = headers.findIndex(h => h.includes('huesped') || h.includes('nombre') || h.includes('guest') || h.includes('persona'));
          const startIdx = headers.findIndex(h => h.includes('llegada') || h.includes('inicio') || h.includes('start') || h.includes('check in'));
          const endIdx = headers.findIndex(h => h.includes('salida') || h.includes('finalizacion') || h.includes('end') || h.includes('check out'));
          const adultsIdx = headers.findIndex(h => h.includes('adultos') || h.includes('adults'));
          const childrenIdx = headers.findIndex(h => h.includes('ninos') || h.includes('children'));

          if (startIdx === -1 || propIdx === -1) {
             return resolve({ success: false, count: 0, type: '' });
          }

          const newRes: Partial<Reservation>[] = [];

          rawLines.slice(1).forEach((line, index) => {
            const vals: string[] = [];
            let currentVal = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') inQuotes = !inQuotes;
              else if (char === delimiter && !inQuotes) {
                vals.push(currentVal.trim().replace(/^"|"$/g, ''));
                currentVal = '';
              } else currentVal += char;
            }
            vals.push(currentVal.trim().replace(/^"|"$/g, ''));

            if (vals.length < headers.length) return;

            const csvPropRaw = vals[propIdx] || '';
            if (!csvPropRaw) return;
            const csvPropNorm = normalize(csvPropRaw);

            const matchedProp = properties.find(p => {
              const appPropNorm = normalize(p.name);
              return csvPropNorm === appPropNorm || 
                     csvPropNorm.includes(appPropNorm) || 
                     appPropNorm.includes(csvPropNorm);
            });

            const finalPropertyId = matchedProp ? matchedProp.id : (properties.length > 0 ? properties[0].id : 'manual');

            const parseDate = (d: string) => {
              if (!d) return '';
              const clean = d.replace(/\s+/g, '').replace(/\//g, '-');
              const parts = clean.split('-');
              if (parts.length === 3) {
                if (parts[0].length === 4) return clean;
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
              return clean;
            };

            const guests = (parseInt(vals[adultsIdx] || '0') + parseInt(vals[childrenIdx] || '0')) || 1;

            newRes.push({
              reservationCode: vals[codeIdx] || `CSV-${index}-${Date.now()}`,
              propertyId: finalPropertyId,
              guestName: (vals[guestIdx] || 'Huésped CSV').toUpperCase(),
              checkIn: parseDate(vals[startIdx]),
              checkOut: parseDate(vals[endIdx]),
              guestCount: guests,
              status: 'upcoming' as const,
              icalLinkId: 'manual'
            });
          });
          
          if (newRes.length > 0) {
            addBulkReservations(newRes);
            resolve({ success: true, count: newRes.length, type: 'Reservas CSV' });
          } else {
            resolve({ success: false, count: 0, type: '' });
          }
        } catch (err) { 
          resolve({ success: false, count: 0, type: '' }); 
        }
      };
      reader.readAsText(file);
    });
  };

  const importDataFromString = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data && (data.properties || data.profiles || data.reservations)) {
        if (data.properties) localStorage.setItem('limpiabnb_properties', JSON.stringify(data.properties));
        if (data.reservations) localStorage.setItem('limpiabnb_reservations', JSON.stringify(data.reservations));
        if (data.inventory) localStorage.setItem('limpiabnb_inventory', JSON.stringify(data.inventory));
        if (data.profiles) localStorage.setItem('limpiabnb_profiles', JSON.stringify(data.profiles));
        if (data.currentProfileId) localStorage.setItem('limpiabnb_current_profile_id', data.currentProfileId);
        
        window.location.reload();
        return true;
      }
      return false;
    } catch (e) { 
      return false; 
    }
  };

  const importData = async (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = await importDataFromString(e.target?.result as string);
        resolve(result);
      };
      reader.readAsText(file);
    });
  };

  const resetData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const addProfile = (profile: Omit<User, 'id'>) => {
    const newId = `u-${Date.now()}`;
    setProfiles(prev => {
      const updated = [...prev, { ...profile, id: newId }];
      if (prev.length === 0) setCurrentProfileId(newId);
      return updated;
    });
  };

  const updateProfile = (profile: User) => {
    setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
  };

  const deleteProfile = (id: string) => {
    if (currentProfileId === id) logout();
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <StoreContext.Provider value={{ 
      properties, reservations, inventory, profiles, currentProfile, currentProfileId,
      addICalLink, removeICalLink, updateInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, syncAll, addBulkReservations, updateReservation, deleteReservation, exportData, getBackupString,
      importData, importCSV, importDataFromString, resetData, clearReservations, addProfile, updateProfile, deleteProfile, selectProfile, addProperty, updateProperty, deleteProperty, logout,
      isLoading 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
