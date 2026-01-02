
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  ClipboardCheck, 
  Package, 
  User as UserIcon, 
  Bell,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Building,
  Smartphone,
  Monitor
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PropertyDetail from './pages/PropertyDetail';
import PropertiesPage from './pages/PropertiesPage';
import CleaningSchedule from './pages/CleaningSchedule';
import InventoryPage from './pages/Inventory';
import ProfilePage from './pages/Profile';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';
import { UserRole, AppNotification } from './types';
import { notificationService } from './services/notificationService';
import { StoreProvider, useStore } from './context/StoreContext';

const NotificationPanel = ({ isOpen, onClose, notifications }: { isOpen: boolean, onClose: () => void, notifications: AppNotification[] }) => {
  if (!isOpen) return null;

  const handleMarkAll = () => {
    notificationService.markAllAsRead();
  };

  const handleRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  return (
    <div className="fixed inset-0 z-[160] flex justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-slate-800">
        <header className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Centro de Avisos</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Logística en tiempo real</p>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={28} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleRead(n.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative group ${n.isRead ? 'bg-gray-50/50 dark:bg-slate-800/30 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30 shadow-lg'}`}
              >
                {!n.isRead && <div className="absolute top-4 right-4 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>}
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl h-fit ${
                    n.type === 'stock' ? 'bg-amber-100 text-amber-600' : 
                    n.type === 'reservation' ? 'bg-blue-100 text-blue-600' : 
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {n.type === 'stock' ? <Package size={20} /> : n.type === 'reservation' ? <Calendar size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic mb-1 tracking-tight">{n.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{n.message}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-3 flex items-center gap-1">
                      <Clock size={10} /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
              <Bell size={64} className="mb-4" />
              <p className="font-black uppercase italic text-gray-500 tracking-tight">Sin notificaciones nuevas</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <footer className="p-6 border-t border-gray-100 dark:border-slate-800">
            <button 
              onClick={handleMarkAll}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
            >
              <Trash2 size={16} />
              Limpiar Todo
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

const ProfileSelector = () => {
  const { profiles, selectProfile } = useStore();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    selectProfile(id);
    navigate('/', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl rotate-3">
             <ClipboardCheck size={40} />
          </div>
          <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic leading-none">LimpiaBnB</h1>
          <p className="text-xl font-bold text-gray-400 uppercase tracking-[0.3em]">Logística Inteligente</p>
        </div>

        <div className="flex flex-wrap justify-center gap-10">
          {profiles.length > 0 ? (
            profiles.map(profile => (
              <button 
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className="group flex flex-col items-center gap-4 transition-all hover:scale-110 active:scale-95"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white dark:bg-slate-900 border-4 border-transparent group-hover:border-blue-500 shadow-xl overflow-hidden flex items-center justify-center transition-all">
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-blue-600 italic uppercase">{profile.name?.[0] || '?'}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{profile.name}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{profile.role}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="max-w-md mx-auto p-12 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800 text-center space-y-6">
               <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-full w-fit mx-auto">
                 <UserIcon size={48} className="text-gray-300" />
               </div>
               <p className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Bienvenido</p>
               <Link 
                to="/settings" 
                className="block w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
               >
                 Configurar Perfil
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Header = ({ 
  notifications, 
  onToggleNotif, 
  isNotifOpen, 
  isDarkMode, 
  onToggleTheme,
  viewMode,
  onToggleViewMode
}: any) => {
  const { currentProfile, logout } = useStore();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleLogoutAction = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-3 tracking-tight uppercase italic leading-none">
          <ClipboardCheck size={28} className={currentProfile && viewMode === 'web' ? 'md:hidden' : ''} />
          <span className={currentProfile && viewMode === 'web' ? 'md:hidden' : ''}>LimpiaBnB</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleViewMode} 
          className="p-3 rounded-2xl text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 transition-all group relative"
          title={viewMode === 'web' ? 'Cambiar a vista móvil' : 'Cambiar a vista web'}
        >
          {viewMode === 'web' ? <Smartphone size={20} /> : <Monitor size={20} />}
        </button>

        <button onClick={onToggleTheme} className="p-3 rounded-2xl text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 transition-all">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {currentProfile && (
          <>
            <button onClick={onToggleNotif} className={`relative p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 transition-all active:scale-95 ${isNotifOpen ? 'text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 dark:text-slate-400'}`}>
              <Bell size={22} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            
            <button 
              onClick={handleLogoutAction}
              className="md:hidden p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white ml-1 transition-all"
            >
              <LogOut size={22} />
            </button>

            <div className="ml-2 w-11 h-11 rounded-2xl border-2 border-white dark:border-slate-800 bg-blue-600 overflow-hidden shadow-lg flex items-center justify-center text-white font-black italic text-lg leading-none">
              {currentProfile?.photoUrl ? <img src={currentProfile.photoUrl} alt="" className="w-full h-full object-cover" /> : (currentProfile?.name?.[0] || '?')}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

const Navigation = ({ isActive, viewMode }: { isActive: (path: string) => boolean, viewMode: 'web' | 'mobile' }) => {
  const { currentProfile, logout } = useStore();
  const navigate = useNavigate();

  if (!currentProfile) return null;

  const handleLogoutAction = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { path: '/', label: 'Panel', icon: Home },
    { path: '/properties', label: 'Anuncios', icon: Building },
    { path: '/calendar', label: 'Agenda', icon: Calendar },
    { path: '/schedule', label: 'Limpiezas', icon: ClipboardCheck },
    { path: '/inventory', label: 'Stock', icon: Package },
    { path: '/profile', label: 'Mi Cuenta', icon: UserIcon },
  ];

  return (
    <>
      <nav className={`${viewMode === 'mobile' ? 'hidden' : 'hidden md:flex'} flex-col w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 h-screen sticky top-0`}>
        <div className="p-8">
          <h1 className="text-3xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-3 italic tracking-tight uppercase leading-none">
            <ClipboardCheck size={32} /> LimpiaBnB
          </h1>
        </div>
        
        <div className="flex-1 px-6 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 font-black italic uppercase tracking-wider' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold'}`}>
              <item.icon size={22} /> <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-6 space-y-3">
          <Link to="/settings" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${isActive('/settings') ? 'bg-gray-100 dark:bg-slate-800 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold'}`}>
            <SettingsIcon size={22} /> <span className="text-sm">Configuración</span>
          </Link>
          <button 
            onClick={handleLogoutAction}
            className="w-full flex items-center gap-4 px-6 py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95"
          >
            <LogOut size={22} /> <span className="text-xs">Cambiar Perfil</span>
          </button>
        </div>
      </nav>

      <nav className={`${viewMode === 'mobile' ? 'flex' : 'md:hidden flex'} fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 justify-around items-center h-20 px-2 z-[60] shadow-2xl`}>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center w-full h-full transition-all ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`}>
            <item.icon size={24} className={isActive(item.path) ? 'scale-110' : ''} />
            <span className="text-[9px] mt-1 font-black uppercase tracking-widest leading-none">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

const AppContent: React.FC = () => {
  const { currentProfileId, logout } = useStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    notificationService.requestPermission();
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  if (!currentProfileId && location.pathname !== '/settings') {
    return <ProfileSelector />;
  }

  const toggleViewMode = () => setViewMode(prev => prev === 'web' ? 'mobile' : 'web');

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200 ${viewMode === 'mobile' ? 'items-center justify-center p-4' : ''}`}>
      <div className={`flex flex-1 ${viewMode === 'mobile' ? 'max-w-[430px] h-[850px] max-h-[92vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-900 dark:border-slate-800 relative overflow-hidden flex-col transition-all duration-300' : 'min-h-screen'}`}>
        
        <Navigation isActive={(path: string) => location.pathname === path} viewMode={viewMode} />
        
        <div className="flex-1 flex flex-col pb-24 md:pb-0 relative overflow-y-auto overflow-x-hidden">
          <Header 
            notifications={notifications} 
            onToggleNotif={() => setIsNotifOpen(!isNotifOpen)}
            isNotifOpen={isNotifOpen}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />
          <main className={`flex-1 p-6 md:p-10 mx-auto w-full ${viewMode === 'web' ? 'max-w-7xl' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/schedule" element={<CleaningSchedule />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          
          <NotificationPanel 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
            notifications={notifications} 
          />
        </div>

        {viewMode === 'mobile' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 dark:bg-slate-800 rounded-b-[1.5rem] z-[100] flex items-center justify-center">
            <div className="w-10 h-1 bg-gray-700 dark:bg-slate-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <AppContent />
  </StoreProvider>
);

const AppWrapper = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppWrapper;
