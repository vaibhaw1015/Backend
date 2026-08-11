import { 
  Building2, 
  Users, 
  Package, 
  FileText, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { User, Role } from '../types';

interface NavbarProps {
  user: User;
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, currentTab, setTab, onLogout }: NavbarProps) {
  
  // Custom badges and background colors for different user roles
  const roleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/40';
      case 'SALES':
        return 'text-purple-400 bg-purple-950/50 border-purple-800/40';
      case 'WAREHOUSE':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/40';
      case 'ACCOUNTS':
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40';
      default:
        return 'text-slate-400 bg-slate-800/50 border-slate-700/40';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'customers', label: 'Customers CRM', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { id: 'products', label: 'Products & Stock', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'challans', label: 'Sales Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FUNDSROOM ERP
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Wholesale CRM</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col space-y-2">
          <div>
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center space-x-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${roleBadgeStyle(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation Link list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            // Check if current user role has access to the tab
            if (!item.roles.includes(user.role)) return null;

            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  isActive 
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-lg shadow-black/20' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button footer */}
      <div className="p-6 border-t border-slate-850">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
