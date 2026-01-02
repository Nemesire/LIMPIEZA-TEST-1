
export enum UserRole {
  HOST = 'HOST',
  CLEANER = 'CLEANER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  photoUrl?: string;
  preferences?: string;
}

export interface ICalLink {
  id: string;
  url: string;
  label: string;
  lastSynced?: string;
}

export interface Property {
  id: string;
  name: string;
  internalName?: string; // Nombre para gestión interna
  type: 'room' | 'whole';
  address: string;
  imageUrl: string;
  icalLinks: ICalLink[];
  description?: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  icalLinkId: string;
  guestName: string;
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  checkInTime?: string; // Formato HH:mm
  checkOutTime?: string; // Formato HH:mm
  status: 'upcoming' | 'ongoing' | 'completed';
  guestCount?: number;
  reservationCode?: string;
  phoneSuffix?: string;
  observations?: string;
}

export interface CleaningTask {
  id: string;
  propertyId: string;
  reservationId: string;
  date: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'cleaning' | 'consumable' | 'linen';
  stock: number;
  minStock: number;
  unit: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reservation' | 'cleaning' | 'stock' | 'system';
  timestamp: string;
  isRead: boolean;
  propertyId?: string;
  targetRole?: UserRole;
}
