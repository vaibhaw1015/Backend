import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  ClipboardList, 
  ArrowUpRight
} from 'lucide-react';
import { Customer, Product, Challan } from '../types';
import api from '../api';

interface DashboardProps {
  token: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resCust, resProd, resChal] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/challans')
      ]);

      const dataCust = resCust.data;
      const dataProd = resProd.data;
      const dataChal = resChal.data;

      setCustomers(Array.isArray(dataCust) ? dataCust : (dataCust.data ?? []));
      setProducts(Array.isArray(dataProd) ? dataProd : (dataProd.data ?? []));
      setChallans(Array.isArray(dataChal) ? dataChal : (dataChal.data ?? []));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="flex flex-col items-center space-y-3">
          <Activity className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-600 text-sm font-semibold">Generating dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 p-6 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Metrics Fetch Error</h3>
          <p className="text-sm text-slate-500">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate calculations
  const activeCustomersCount = customers.filter(c => c.status === 'ACTIVE').length;
  const leadCustomersCount = customers.filter(c => c.status === 'LEAD').length;
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockAlert);
  const lowStockCount = lowStockProducts.length;
  const totalProductsCount = products.length;
  
  const confirmedChallansCount = challans.filter(c => c.status === 'CONFIRMED').length;
  const draftChallansCount = challans.filter(c => c.status === 'DRAFT').length;

  return (
    <div className="flex-1 p-8 bg-slate-50 text-slate-900 space-y-8 min-h-screen overflow-y-auto">
      {/* Top Banner Header */}
      <div className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">System Operations Console</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time overview of your wholesale distribution and customer CRM pipeline</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 transition border border-slate-200 cursor-pointer shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Sync Real-Time Feed</span>
          </button>
        </div>
      </div>

      {/* Grid Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CRM Leads Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">CRM Customer Base</p>
            <h3 className="text-2xl font-black text-slate-900">{customers.length}</h3>
            <p className="text-xs text-purple-600 font-semibold">{activeCustomersCount} Active • {leadCustomersCount} Leads</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl group-hover:scale-110 transition duration-200">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
        </div>

        {/* Stock Alerts Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
            <h3 className="text-2xl font-black text-rose-500">{lowStockCount}</h3>
            <p className="text-xs text-slate-500 font-semibold">Out of {totalProductsCount} Catalog Items</p>
          </div>
          <div className={`p-3 border rounded-xl group-hover:scale-110 transition duration-200 ${
            lowStockCount > 0 
              ? 'bg-rose-50 border-rose-100 animate-pulse' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
        </div>

        {/* Confirmed Challans Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Challans</p>
            <h3 className="text-2xl font-black text-emerald-500">{confirmedChallansCount}</h3>
            <p className="text-xs text-slate-500 font-semibold">{draftChallansCount} Pending Draft Challans</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl group-hover:scale-110 transition duration-200">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Total Quantity Moved Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Distribution Flow</p>
            <h3 className="text-2xl font-black text-blue-500">
              {challans.reduce((sum, c) => c.status === 'CONFIRMED' ? sum + c.totalQuantity : sum, 0)}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">Total confirmed units dispatched</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl group-hover:scale-110 transition duration-200">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
        </div>

      </div>

      {/* Main Analytics Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Alerts Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-rose-500" />
              <h4 className="text-base font-bold text-slate-900">Stock Replenishment Alerts</h4>
            </div>
            <button 
              onClick={() => navigate('/products')} 
              className="text-xs font-bold text-blue-500 hover:text-blue-600 transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Inventory</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[250px]">
            {lowStockCount === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-sm text-slate-500">
                All inventory products are above minimum levels. Healthy stock logs.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 pb-2">
                    <th className="pb-2 font-semibold">Item & SKU</th>
                    <th className="pb-2 font-semibold">Warehouse</th>
                    <th className="pb-2 font-semibold">Alert Limit</th>
                    <th className="pb-2 font-semibold text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">
                        <div>{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-xs">{p.location}</td>
                      <td className="py-2.5 text-slate-500 font-semibold">{p.minStockAlert} units</td>
                      <td className="py-2.5 text-right font-bold text-rose-600">
                        <span className="bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100">{p.currentStock} units</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* System activity stream */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
            <h4 className="text-base font-bold text-slate-900">System Audit & Timeline</h4>
          </div>

          <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Enterprise Distribution Events</p>
              {challans.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No activity logged.</p>
              ) : (
                challans.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600">{c.challanNumber}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-slate-600 font-semibold">{c.customer?.businessName}</span>
                      </div>
                      <p className="text-xs text-slate-500">Created by: {c.createdBy} • Quantity: {c.totalQuantity} items</p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        c.status === 'CONFIRMED' 
                          ? 'text-emerald-700 bg-emerald-100 border-emerald-200' 
                          : c.status === 'DRAFT' 
                          ? 'text-amber-700 bg-amber-100 border-amber-200' 
                          : 'text-rose-700 bg-rose-100 border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Recent CRM Interactions</p>
              {customers.every(c => !c.followUpDate) ? (
                <p className="text-sm text-slate-500 italic">No CRM contacts tracked.</p>
              ) : (
                customers
                  .filter(c => c.followUpDate)
                  .slice(0, 2)
                  .map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">{c.businessName}</span>
                        <span className="text-[10px] text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                          Follow-Up Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic">"{c.notes || 'No notes summary available'}"</p>
                      <p className="text-[10px] text-slate-400">Last activity: {new Date(c.followUpDate!).toLocaleDateString()}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
