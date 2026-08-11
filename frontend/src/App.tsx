import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Products from './components/Products';
import Challans from './components/Challans';
import { User } from './types';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fundsroom_token'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('fundsroom_user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const storedToken = localStorage.getItem('fundsroom_token');
      const storedUser = localStorage.getItem('fundsroom_user');
      
      if (!storedToken || !storedUser) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        if (isMounted) {
          if (data && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            throw new Error('Invalid user payload');
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('fundsroom_token');
          localStorage.removeItem('fundsroom_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyToken();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = (newToken: string, loggedInUser: User) => {
    localStorage.setItem('fundsroom_token', newToken);
    localStorage.setItem('fundsroom_user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    setTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('fundsroom_token');
    localStorage.removeItem('fundsroom_user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Loading Fundsroom ERP...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const renderTabContent = () => {
    switch (tab) {
      case 'dashboard':
        return <Dashboard token={token} setTab={setTab} />;
      case 'customers':
        if (user.role === 'WAREHOUSE') {
          return (
            <div className="flex-1 p-8 bg-slate-950 flex items-center justify-center text-center">
              <div className="max-w-md space-y-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Access Restricted</h3>
                <p className="text-xs text-slate-400">Your role (WAREHOUSE) does not have permission to view Customer CRM profiles.</p>
              </div>
            </div>
          );
        }
        return <Customers token={token} userRole={user.role} />;
      case 'products':
        return <Products token={token} userRole={user.role} />;
      case 'challans':
        return <Challans token={token} userRole={user.role} />;
      default:
        return <Dashboard token={token} setTab={setTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Navbar user={user} currentTab={tab} setTab={setTab} onLogout={handleLogout} />

      {/* Primary Workspace View */}
      {renderTabContent()}
    </div>
  );
}
