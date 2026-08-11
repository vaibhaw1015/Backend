import { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  FileCheck2, 
  FileX2, 
  Printer, 
  X 
} from 'lucide-react';
import { Challan, Customer, Product, Role } from '../types';
import api from '../api';

interface ChallansProps {
  token: string;
  userRole: Role;
}

export default function Challans({ token: _token, userRole }: ChallansProps) {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [selectedChal, setSelectedChal] = useState<Challan | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Wizard Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [wizardItems, setWizardItems] = useState<{ productId: string; quantity: number }[]>([]);
  
  // Item entry temporary states
  const [tempProductId, setTempProductId] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      let url = '/challans?';
      if (statusFilter) url += `status=${statusFilter}`;
      
      const response = await api.get(url);
      const data = response.data;
      setChallans(data);

      if (selectedChal) {
        const updated = data.find((c: Challan) => c.id === selectedChal.id);
        if (updated) {
          fetchChallanDetails(updated.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallanDetails = async (id: string) => {
    try {
      const response = await api.get(`/challans/${id}`);
      setSelectedChal(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWizardMetadata = async () => {
    try {
      const [resCust, resProd] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]);
      const dCust = resCust.data;
      const dProd = resProd.data;
      setCustomers(Array.isArray(dCust) ? dCust : (dCust.data ?? []));
      setProducts(Array.isArray(dProd) ? dProd : (dProd.data ?? []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [statusFilter]);

  useEffect(() => {
    if (showAddModal) {
      fetchWizardMetadata();
      setSelectedCustomerId('');
      setWizardItems([]);
      setTempProductId('');
      setTempQuantity(1);
    }
  }, [showAddModal]);

  const handleAddWizardItem = () => {
    if (!tempProductId || tempQuantity <= 0) return;
    
    // Check duplication
    const duplicateIdx = wizardItems.findIndex(i => i.productId === tempProductId);
    if (duplicateIdx > -1) {
      const updated = [...wizardItems];
      updated[duplicateIdx].quantity += tempQuantity;
      setWizardItems(updated);
    } else {
      setWizardItems([...wizardItems, { productId: tempProductId, quantity: tempQuantity }]);
    }
    
    setTempProductId('');
    setTempQuantity(1);
  };

  const handleRemoveWizardItem = (idx: number) => {
    setWizardItems(wizardItems.filter((_, i) => i !== idx));
  };

  const handleCreateChallan = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId || wizardItems.length === 0) return;

    try {
      await api.post('/challans', {
        customerId: selectedCustomerId,
        status,
        items: wizardItems,
      });

      setShowAddModal(false);
      fetchChallans();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.details && Array.isArray(errData.details)) {
        const msg = errData.details
          .map((d: any) => `${d.product} (${d.sku}): need ${d.requested}, have ${d.available}`)
          .join('\n');
        alert('Insufficient stock for:\n' + msg);
      } else {
        alert(errData?.message || err.message || 'Failed to create challan');
      }
    }
  };

  const handleUpdateStatus = async (newStatus: 'CONFIRMED' | 'CANCELLED') => {
    if (!selectedChal) return;
    
    const confirmMsg = newStatus === 'CONFIRMED' 
      ? 'Confirming this Challan will lock stock and reduce inventory counts. Proceed?'
      : 'Cancelling this Challan will release stock and restore inventory counts. Proceed?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint = newStatus === 'CONFIRMED' ? 'confirm' : 'cancel';
      await api.put(`/challans/${selectedChal.id}/${endpoint}`);
      fetchChallans();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.details && Array.isArray(errData.details)) {
        const msg = errData.details
          .map((d: any) => `${d.product} (${d.sku}): need ${d.requested}, have ${d.available}`)
          .join('\n');
        alert('Insufficient stock for:\n' + msg);
      } else {
        alert(errData?.message || err.message || 'Status transition failed');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper status styling
  const statusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30';
      case 'DRAFT':
        return 'text-amber-400 bg-amber-950/30 border-amber-900/30';
      case 'CANCELLED':
        return 'text-rose-400 bg-rose-950/30 border-rose-900/30';
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  const isSalesOrAdmin = userRole === 'ADMIN' || userRole === 'SALES';
  const isAccountsOrAdmin = userRole === 'ADMIN' || userRole === 'ACCOUNTS';

  // Calculate live values of wizard items
  const wizardTotalQty = wizardItems.reduce((sum, item) => sum + item.quantity, 0);
  const wizardTotalVal = wizardItems.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId);
    return sum + (p ? Number(p.unitPrice) * item.quantity : 0);
  }, 0);

  return (
    <div className="flex-1 flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Left Column: Challans List */}
      <div className="flex-1 flex flex-col p-8 border-r border-slate-900 overflow-y-auto space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <FileText className="w-6 h-6 text-sky-400" />
              <span>Sales Challan Ledger</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Generate distribution challans, apply inventory stock locks, print invoices</p>
          </div>

          {isSalesOrAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/10 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Challan</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {['', 'DRAFT', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                statusFilter === st 
                  ? 'bg-slate-800 text-sky-400 border-slate-700' 
                  : 'text-slate-450 hover:bg-slate-900 border-slate-900'
              }`}
            >
              {st === '' ? 'All Invoices' : st}
            </button>
          ))}
        </div>

        {/* Invoices List Ledger */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
          {loading && challans.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading ledger...
            </div>
          ) : challans.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No challans found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800/80">
                    <th className="p-4 font-semibold">Challan Number</th>
                    <th className="p-4 font-semibold">Client Name</th>
                    <th className="p-4 font-semibold">Created Date</th>
                    <th className="p-4 font-semibold">Total Quantity</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {challans.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => fetchChallanDetails(c.id)}
                      className={`hover:bg-slate-800/30 cursor-pointer transition ${
                        selectedChal?.id === c.id ? 'bg-slate-800/40 border-l-2 border-l-sky-500' : ''
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-sky-400">{c.challanNumber}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-200">{c.customer?.businessName}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{c.customer?.name}</p>
                      </td>
                      <td className="p-4 text-slate-450">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-300 font-semibold">{c.totalQuantity} units</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border ${statusBadgeStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Challan detail receipt/invoice */}
      <div id="printable-challan" className="w-96 bg-slate-900/60 border-l border-slate-850 flex flex-col h-screen overflow-y-auto print:fixed print:inset-0 print:z-50 print:bg-white print:text-black print:w-full print:h-full">
        {selectedChal ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            
            {/* Header info */}
            <div className="p-6 border-b border-slate-800 space-y-4 print:border-b-2 print:border-black">
              <div className="flex justify-between items-start print:hidden">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border ${statusBadgeStyle(selectedChal.status)}`}>
                  {selectedChal.status}
                </span>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handlePrint}
                    className="p-1.5 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold">Print</span>
                  </button>
                </div>
              </div>

              {/* Invoice Brand header */}
              <div className="space-y-1">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest print:text-slate-600">Distribution Challan</h3>
                <h2 className="font-black text-xl text-sky-400 font-mono print:text-black">{selectedChal.challanNumber}</h2>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(selectedChal.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Customer and Issuer details */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2 print:bg-slate-100 print:text-black print:border-black">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold print:text-slate-600">Client / Consignee</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5 print:text-black">{selectedChal.customer?.businessName}</p>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">{selectedChal.customer?.name} • {selectedChal.customer?.address}</p>
                  {selectedChal.customer?.gstNumber && (
                    <p className="text-[9px] font-mono text-sky-400 mt-0.5 print:text-slate-700">GSTIN: {selectedChal.customer.gstNumber}</p>
                  )}
                </div>
                <div className="border-t border-slate-850/80 pt-2 print:border-black">
                  <p className="text-[9px] text-slate-500 uppercase font-bold print:text-slate-600">Issuer / Sales Rep</p>
                  <p className="text-[10px] font-semibold text-slate-300 mt-0.5 print:text-black">{selectedChal.createdBy}</p>
                </div>
              </div>
            </div>

            {/* Snapshot Items table */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transaction Items Snapshot</p>
              
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-850 pb-2 print:border-black print:text-black">
                    <th className="pb-2 font-semibold">SKU & Item</th>
                    <th className="pb-2 font-semibold text-right">Price</th>
                    <th className="pb-2 font-semibold text-right">Qty</th>
                    <th className="pb-2 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 print:divide-black">
                  {selectedChal.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-200 print:text-black">{item.productNameSnapshot}</div>
                        <div className="text-[9px] text-slate-500 font-mono print:text-slate-600">{item.skuSnapshot}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400 print:text-black">${Number(item.unitPriceSnapshot).toFixed(2)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-350 print:text-black">{item.quantity}</td>
                      <td className="py-2.5 text-right font-bold text-slate-200 print:text-black">
                        ${(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-800 pt-4 space-y-1.5 text-xs text-right print:border-black">
                <div className="text-slate-500">Total Quantity: <span className="font-semibold text-slate-300 print:text-black">{selectedChal.totalQuantity} units</span></div>
                <div className="text-sm font-black text-white print:text-black">
                  Estimated Total Value: <span className="text-emerald-400 print:text-black">
                    ${selectedChal.items?.reduce((sum, item) => sum + (Number(item.unitPriceSnapshot) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow state machine actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/20 space-y-3.5 print:hidden">
              {selectedChal.status === 'DRAFT' && (
                <div className="grid grid-cols-2 gap-3">
                  {isSalesOrAdmin && (
                    <button
                      onClick={() => handleUpdateStatus('CONFIRMED')}
                      className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow active:scale-[0.98] transition cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Confirm Challan</span>
                    </button>
                  )}
                  {isAccountsOrAdmin && (
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-slate-900 border border-rose-900/60 hover:bg-rose-950/20 text-rose-400 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      <FileX2 className="w-4 h-4" />
                      <span>Cancel Invoice</span>
                    </button>
                  )}
                </div>
              )}

              {selectedChal.status === 'CONFIRMED' && isAccountsOrAdmin && (
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-slate-900 border border-rose-900/60 hover:bg-rose-950/20 text-rose-400 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  <FileX2 className="w-4 h-4" />
                  <span>Cancel Invoice (Release Stock)</span>
                </button>
              )}

              {selectedChal.status === 'CANCELLED' && (
                <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-400 italic text-center">
                  This challan is cancelled. Stock locks have been successfully released and audit entries compiled.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-500">
            Select a sales challan invoice from the ledger to inspect client billing, quantities, and stock confirmations.
          </div>
        )}
      </div>

      {/* CREATE CHALLAN WIZARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-white">Create Challan Wizard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a customer and build the transaction package</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-6">
              
              {/* Customer Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Consignee</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-300 transition"
                >
                  <option value="">Select a Customer Lead or Distributor...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-850 my-4"></div>

              {/* Items selection workspace */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Item</label>
                  <select
                    value={tempProductId}
                    onChange={(e) => setTempProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-350 transition"
                  >
                    <option value="">Choose product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.unitPrice).toFixed(2)} - Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dispatch Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none rounded-xl text-xs text-slate-200 transition font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddWizardItem}
                  disabled={!tempProductId}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-sky-400 font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  Add to Challan list
                </button>
              </div>

              {/* Live added items preview */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Challan Items package</p>
                {wizardItems.length === 0 ? (
                  <div className="p-8 bg-slate-950/40 border border-slate-850 rounded-2xl text-center text-xs text-slate-500">
                    No products added to package list yet. Select an item above.
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-500 border-b border-slate-850/80">
                          <th className="p-3 font-semibold">Item & SKU</th>
                          <th className="p-3 font-semibold text-right">Price</th>
                          <th className="p-3 font-semibold text-right">Qty</th>
                          <th className="p-3 font-semibold text-right">Subtotal</th>
                          <th className="p-3 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {wizardItems.map((item, idx) => {
                          const p = products.find(p => p.id === item.productId);
                          if (!p) return null;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/10">
                              <td className="p-3">
                                <div className="font-semibold text-slate-200">{p.name}</div>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{p.sku}</div>
                              </td>
                              <td className="p-3 text-right font-mono text-slate-400">${Number(p.unitPrice).toFixed(2)}</td>
                              <td className="p-3 text-right font-semibold text-slate-350">{item.quantity}</td>
                              <td className="p-3 text-right font-bold text-slate-200">
                                ${(Number(p.unitPrice) * item.quantity).toFixed(2)}
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveWizardItem(idx)}
                                  className="text-slate-500 hover:text-rose-500 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wizard Totals */}
              <div className="flex justify-between items-center text-xs p-4 bg-slate-950/60 rounded-2xl border border-slate-850">
                <div className="text-slate-500">Total Items: <span className="font-bold text-slate-300">{wizardTotalQty} units</span></div>
                <div className="font-black text-white">
                  Estimated Invoice Value: <span className="text-emerald-400">${wizardTotalVal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedCustomerId || wizardItems.length === 0}
                  onClick={() => handleCreateChallan('DRAFT')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>💾</span> Save as Draft
                </button>
                <button
                  type="button"
                  disabled={!selectedCustomerId || wizardItems.length === 0}
                  onClick={() => handleCreateChallan('CONFIRMED')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>✅</span> Confirm & Lock Stock
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
