import { 
  Building2, 
  Users, 
  Package, 
  FileText, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();
  const currentTab = location.pathname.replace('/', '') || 'dashboard';
  
  // Custom badges and background colors for different user roles
  const roleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'text-rose-600 bg-rose-100 border-rose-200';
      case 'SALES':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'WAREHOUSE':
        return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'ACCOUNTS':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'customers', label: 'Customers CRM', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { id: 'products', label: 'Products & Stock', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'challans', label: 'Sales Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shadow-sm z-10">
      <div className="p-6 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-800">
              FUNDSROOM ERP
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Wholesale CRM</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col space-y-2 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center space-x-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${roleBadgeStyle(user.role)}`}>
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
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
