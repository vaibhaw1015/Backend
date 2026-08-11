import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  FileSpreadsheet, 
  Activity, 
  X, 
  PlusCircle, 
  User, 
  Edit3 
} from 'lucide-react';
import { Customer, CustomerType, CustomerStatus, Role } from '../types';
import api from '../api';

interface CustomersProps {
  token: string;
  userRole: Role;
}

export default function Customers({ token: _token, userRole }: CustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    notes: '',
  });

  // Note State
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const isWriteAllowed = userRole === 'ADMIN' || userRole === 'SALES';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = `/customers?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await api.get(url);
      const raw = response.data;
      const list: Customer[] = Array.isArray(raw) ? raw : (raw.data ?? []);
      setCustomers(list);
      
      // Keep selected customer details synced if visible
      if (selectedCust) {
        const updated = list.find((c: Customer) => c.id === selectedCust.id);
        if (updated) {
          fetchCustomerDetails(updated.id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id: string) => {
    try {
      const response = await api.get(`/customers/${id}`);
      setSelectedCust(response.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter, statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowAddModal(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    try {
      await api.put(`/customers/${selectedCust.id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !newNote.trim()) return;
    setNoteLoading(true);
    try {
      await api.post(`/customers/${selectedCust.id}/follow-ups`, { note: newNote });
      setNewNote('');
      fetchCustomerDetails(selectedCust.id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setNoteLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      notes: '',
    });
  };

  const openEditModal = () => {
    if (!selectedCust) return;
    setFormData({
      name: selectedCust.name,
      mobile: selectedCust.mobile,
      email: selectedCust.email,
      businessName: selectedCust.businessName,
      gstNumber: selectedCust.gstNumber || '',
      customerType: selectedCust.customerType,
      address: selectedCust.address,
      status: selectedCust.status,
      notes: selectedCust.notes || '',
    });
    setShowEditModal(true);
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Left Column: Customers List */}
      <div className="flex-1 flex flex-col p-8 border-r border-slate-900 overflow-y-auto space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Users className="w-6 h-6 text-sky-400" />
              <span>CRM Customer Profiles</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage leads, follow-ups, and distributors accounts database</p>
          </div>

          {isWriteAllowed && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/10 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer File</span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/50 text-rose-400 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none rounded-xl text-xs transition text-slate-200"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300"
          >
            <option value="">All Customer Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Leads</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Customers Table / Grid */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
          {loading && customers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading CRM database...
            </div>
          ) : customers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No matching customer profile found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800/80">
                    <th className="p-4 font-semibold">Business/Contact</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">GSTIN</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Interactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {customers.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => fetchCustomerDetails(c.id)}
                      className={`hover:bg-slate-800/30 cursor-pointer transition ${
                        selectedCust?.id === c.id ? 'bg-slate-800/40 border-l-2 border-l-sky-500' : ''
                      }`}
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-200 text-xs">{c.businessName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{c.name} • {c.mobile}</p>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          c.customerType === 'DISTRIBUTOR' 
                            ? 'text-purple-400 bg-purple-950/40 border border-purple-900/20' 
                            : c.customerType === 'WHOLESALE' 
                            ? 'text-blue-400 bg-blue-950/40 border border-blue-900/20' 
                            : 'text-slate-400 bg-slate-850'
                        }`}>
                          {c.customerType}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{c.gstNumber || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${
                          c.status === 'ACTIVE' 
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30' 
                            : c.status === 'LEAD' 
                            ? 'text-amber-400 bg-amber-950/30 border-amber-900/30' 
                            : 'text-slate-400 bg-slate-850/50 border-slate-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold text-[10px]">
                        {c._count?.followUpNotes || 0} notes • {c._count?.challans || 0} invoices
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Selected Customer File details */}
      <div className="w-96 bg-slate-900/60 border-l border-slate-850 flex flex-col h-screen overflow-y-auto">
        {selectedCust ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Header info */}
            <div className="p-6 border-b border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedCust.businessName}</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedCust.name}</span>
                  </p>
                </div>
                {isWriteAllowed && (
                  <button 
                    onClick={openEditModal}
                    className="p-1.5 hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Contacts details */}
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono">{selectedCust.mobile}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate">{selectedCust.email}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{selectedCust.address}</span>
                </div>
                {selectedCust.gstNumber && (
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      GSTIN: {selectedCust.gstNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-Up timelines */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)]">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Follow-Up Notes Timeline</span>
              </h4>

              {/* Add Note Form */}
              {isWriteAllowed && (
                <form onSubmit={handleAddSubmit} className="space-y-2">
                  <textarea
                    placeholder="Type follow-up note (e.g. customer request catalog, called today)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={noteLoading || !newNote.trim()}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow transition cursor-pointer disabled:opacity-50"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{noteLoading ? 'Saving...' : 'Add Note'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline feed */}
              <div className="space-y-3.5 pt-2">
                {!selectedCust.followUpNotes || selectedCust.followUpNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No notes summary logged. Enter a new note above to start logging.</p>
                ) : (
                  selectedCust.followUpNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs relative">
                      <div className="absolute top-3 right-3 text-[8px] text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                      <p className="font-bold text-sky-400 text-[10px]">{note.createdBy}</p>
                      <p className="text-slate-300 leading-relaxed text-[11px]">"{note.note}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-500">
            Select a customer from the database list to inspect contact profile and follow-up history logs.
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-white">Create Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Phone</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="27AAAAA1111A1Z1"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Type</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300 transition"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">CRM Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300 transition"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Office Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Corporate Tower, Sector 5..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes Summary</label>
                <textarea
                  placeholder="Additional context about business scale, payment history..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="col-span-2 flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/10 active:scale-[0.98] transition cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-white">Edit Customer Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Phone</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="27AAAAA1111A1Z1"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Type</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300 transition"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">CRM Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300 transition"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Office Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Corporate Tower, Sector 5..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes Summary</label>
                <textarea
                  placeholder="Additional context about business scale, payment history..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition"
                />
              </div>

              <div className="col-span-2 flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/10 active:scale-[0.98] transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
