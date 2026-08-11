import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  MapPin, 
  Activity, 
  X, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  DollarSign, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { Product, Role } from '../types';
import api from '../api';

interface ProductsProps {
  token: string;
  userRole: Role;
}

export default function Products({ token: _token, userRole }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 0,
    location: '',
  });

  const [adjustment, setAdjustment] = useState({
    quantityChanged: 0,
    reason: '',
  });
  const [adjustLoading, setAdjustLoading] = useState(false);

  const isWriteAllowed = userRole === 'ADMIN' || userRole === 'WAREHOUSE';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (lowStockFilter) url += `lowStock=true&`;

      const response = await api.get(url);
      const raw = response.data;
      const list: Product[] = Array.isArray(raw) ? raw : (raw.data ?? []);
      setProducts(list);

      if (selectedProd) {
        const updated = list.find((p: Product) => p.id === selectedProd.id);
        if (updated) {
          fetchProductDetails(updated.id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      setSelectedProd(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;
    try {
      await api.put(`/products/${selectedProd.id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;
    setAdjustLoading(true);
    try {
      await api.post(`/products/${selectedProd.id}/stock-movements`, adjustment);
      setShowAdjustModal(false);
      setAdjustment({ quantityChanged: 0, reason: '' });
      fetchProductDetails(selectedProd.id);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setAdjustLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minStockAlert: 0,
      location: '',
    });
  };

  const openEditModal = () => {
    if (!selectedProd) return;
    setFormData({
      name: selectedProd.name,
      sku: selectedProd.sku,
      category: selectedProd.category,
      unitPrice: Number(selectedProd.unitPrice),
      currentStock: selectedProd.currentStock,
      minStockAlert: selectedProd.minStockAlert,
      location: selectedProd.location,
    });
    setShowEditModal(true);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="flex-1 flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Left Column: Products catalog */}
      <div className="flex-1 flex flex-col p-8 border-r border-slate-200 overflow-y-auto space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-500" />
              <span>Inventory & Stock Control</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage catalog listings, min-stock levels, locations, and audit logs</p>
          </div>

          {isWriteAllowed && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm transition text-slate-900 shadow-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-700 transition shadow-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-500 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="rounded border-slate-300 bg-white text-blue-500 focus:ring-blue-500/20 shadow-sm"
            />
            <span>Show Low Stock Alerts Only</span>
          </label>
        </div>

        {/* Ledger Grid */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[300px] shadow-sm">
          {loading && products.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              Fetching active ledger...
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No matching products in stock database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold">SKU & Item Details</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Unit Price</th>
                    <th className="p-4 font-semibold">Location</th>
                    <th className="p-4 font-semibold">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const isLowStock = p.currentStock <= p.minStockAlert;
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => fetchProductDetails(p.id)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${
                          selectedProd?.id === p.id ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                        }`}
                      >
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{p.sku}</p>
                        </td>
                        <td className="p-4 text-slate-600">{p.category}</td>
                        <td className="p-4 font-semibold text-slate-700">${Number(p.unitPrice).toFixed(2)}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{p.location}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1.5 rounded-xl text-xs font-black border ${
                            isLowStock 
                              ? 'text-rose-700 bg-rose-100 border-rose-200 animate-pulse' 
                              : 'text-emerald-700 bg-emerald-100 border-emerald-200'
                          }`}>
                            {p.currentStock} units
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Selected Product Card & Movements Log */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-screen overflow-y-auto shadow-sm">
        {selectedProd ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Main Info */}
            <div className="p-6 border-b border-slate-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedProd.name}</h3>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">{selectedProd.sku}</p>
                </div>
                {isWriteAllowed && (
                  <button 
                    onClick={openEditModal}
                    className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Data specifications */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Category</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProd.category}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Unit Price</span>
                  <div className="flex items-center space-x-1.5 text-emerald-600 font-black">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>${Number(selectedProd.unitPrice).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Warehouse Bin</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">{selectedProd.location}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Alert Level</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                    <span>&lt; {selectedProd.minStockAlert} units</span>
                  </div>
                </div>
              </div>

              {/* Adjust Stock Button */}
              {isWriteAllowed && (
                <button
                  onClick={() => { setAdjustment({ quantityChanged: 0, reason: '' }); setShowAdjustModal(true); }}
                  className="w-full flex items-center justify-center space-x-2 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 font-bold rounded-xl text-sm shadow-sm active:scale-[0.99] transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Adjust Stock Count</span>
                </button>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-360px)] bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Stock Movement Ledger</span>
              </h4>

              <div className="space-y-3.5">
                {!selectedProd.stockMovements || selectedProd.stockMovements.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No ledger activity tracked.</p>
                ) : (
                  selectedProd.stockMovements.map((move) => {
                    const isIncrease = move.movementType === 'IN';
                    return (
                      <div key={move.id} className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl space-y-1 text-sm relative">
                        <div className="absolute top-3 right-3 text-[8px] text-slate-400">
                          {new Date(move.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isIncrease ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span className={`font-black uppercase text-xs ${isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncrease ? '+' : ''}{move.quantityChanged} units
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">"{move.reason}"</p>
                        <p className="text-[10px] text-slate-500">Logged by: {move.createdBy}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-sm text-slate-500 bg-slate-50/50">
            Select a product from the ledger inventory to inspect warehouse bins, specifications, and ledger audit timeline logs.
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Create Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Premium Widget A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="WIDG-A-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="Widgets"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    value={formData.unitPrice || ''}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Alert Limit</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Warehouse Location</label>
                <input
                  type="text"
                  required
                  placeholder="Aisle A, Shelf 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Edit Product Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Premium Widget A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="WIDG-A-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="Widgets"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    value={formData.unitPrice || ''}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Alert Limit</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Warehouse Location</label>
                <input
                  type="text"
                  required
                  placeholder="Aisle A, Shelf 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustModal && selectedProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Adjust Stock Count</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProd.name} (SKU: {selectedProd.sku})</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Adjustment Count</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50 (to add) or -20 (to reduce)"
                  value={adjustment.quantityChanged || ''}
                  onChange={(e) => setAdjustment({ ...adjustment, quantityChanged: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition font-mono"
                />
                <p className="text-xs text-slate-500 pt-0.5">
                  Current stock level is <span className="text-blue-600 font-semibold">{selectedProd.currentStock} units</span>. 
                  Resulting stock: <span className="text-blue-600 font-semibold">{selectedProd.currentStock + adjustment.quantityChanged} units</span>.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Reason for Audit Log</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Damaged stock, Monthly inventory check"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-900 transition"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading || adjustment.quantityChanged === 0 || !adjustment.reason}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {adjustLoading ? 'Logging...' : 'Apply Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
