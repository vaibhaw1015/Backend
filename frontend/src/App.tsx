import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import Landing from './components/Landing';
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
  
  const navigate = useNavigate();

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

        const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
        const response = await fetch(`${baseUrl}/auth/me`, {
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
      navigate('/');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const handleLoginSuccess = (newToken: string, loggedInUser: User) => {
    localStorage.setItem('fundsroom_token', newToken);
    localStorage.setItem('fundsroom_user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('fundsroom_token');
    localStorage.removeItem('fundsroom_user');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-base text-slate-600 font-semibold tracking-wide">Loading Fundsroom ERP...</p>
      </div>
    );
  }

  // Handle unauthenticated routes
  if (!token || !user) {
    return (
      <Routes>
        <Route path="/login" element={<Auth onLoginSuccess={handleLoginSuccess} onBack={() => navigate('/')} />} />
        <Route path="/" element={<Landing onGoToLogin={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Primary Workspace View */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard token={token} />} />
        <Route path="/customers" element={
          user.role === 'WAREHOUSE' ? (
            <div className="flex-1 p-8 bg-slate-50 flex items-center justify-center text-center">
              <div className="max-w-md space-y-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                <p className="text-base text-slate-500">Your role (WAREHOUSE) does not have permission to view Customer CRM profiles.</p>
              </div>
            </div>
          ) : (
            <Customers token={token} userRole={user.role} />
          )
        } />
        <Route path="/products" element={<Products token={token} userRole={user.role} />} />
        <Route path="/challans" element={<Challans token={token} userRole={user.role} />} />
        
        {/* Default route redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
