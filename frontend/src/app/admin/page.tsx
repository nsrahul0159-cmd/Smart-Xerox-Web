"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Users, FileText, CheckCircle, IndianRupee } from 'lucide-react';
import { getApiUrl } from "@/lib/config";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check login on load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await axios.get(`${getApiUrl()}/admin/stats`, { headers });
      const ordersRes = await axios.get(`${getApiUrl()}/admin/orders`, { headers });
      
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${getApiUrl()}/orders/${id}/status`, { status: newStatus }, { headers });
      fetchDashboardData(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${getApiUrl()}/admin/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        setIsAuthenticated(true);
        setLoginError('');
      }
    } catch (err) {
      setLoginError('Invalid Administrator credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 text-center">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              required 
            />
          </div>
          {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all outline-none">
            Secure Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          Admin Dashboard
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={fetchDashboardData}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-100 dark:border-slate-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg font-medium text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedOrders}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{stats.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Mobile Orders List */}
      <div className="lg:hidden space-y-4">
        {orders.map((col) => (
          <div key={col._id} className="glass-panel p-5 rounded-2xl border border-white/50 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-mono text-indigo-500 uppercase">{col.displayId || col._id.substring(col._id.length - 8)}</p>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{col.user.name}</h3>
                <p className="text-xs text-gray-500">{col.user.phone}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                ${col.status === 'Paid' ? 'bg-indigo-100 text-indigo-700' : 
                  col.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                  col.status === 'Payment Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}
              `}>
                {col.status}
              </span>
            </div>
            
            <div className="space-y-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {col.files?.map((f: any, i: number) => (
                  <a 
                    key={i} 
                    href={`${getApiUrl()}/uploads/${f.filename}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded flex items-center gap-1 font-bold"
                  >
                    <FileText className="w-3 h-3" />
                    File {i + 1}
                  </a>
                ))}
              </div>
              <div className="flex justify-between items-end">
                 <div className="flex gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <span>{col.totalPages} pgs</span>
                    <span>{col.settings.color}</span>
                    <span>{col.settings.sides}</span>
                 </div>
                 <p className="font-bold text-lg text-indigo-600">₹{col.amount}</p>
              </div>
            </div>

            <div className="pt-3">
               <select 
                value={col.status} 
                onChange={(e) => updateStatus(col._id, e.target.value)}
                className="w-full text-xs px-3 py-2.5 border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-800 outline-none font-semibold"
              >
                <option value="Payment Pending">Payment Pending</option>
                <option value="Paid">Paid</option>
                <option value="Printing">Printing</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center py-10 text-gray-500">No orders found.</p>}
      </div>

      {/* Desktop Orders Table */}
      <div className="hidden lg:block glass-panel rounded-2xl overflow-hidden mt-8 border border-white/50 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Files / Pages</th>
                <th className="px-6 py-4 text-center">Settings</th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {orders.map((col) => (
                <tr key={col._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mb-1">{col.displayId || col._id.substring(col._id.length - 8)}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{col.user.name}</p>
                    <p className="text-xs text-gray-500">{col.user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {col.files?.map((f: any, i: number) => (
                        <a 
                          key={i} 
                          href={`${getApiUrl()}/uploads/${f.filename}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded w-max"
                        >
                          <FileText className="w-3 h-3" />
                          File {i + 1}
                        </a>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{col.totalPages} total pages</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center gap-1 text-[10px] font-bold uppercase">
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">{col.settings.color}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">{col.settings.sides}</span>
                      <span className="px-1.5 py-0.5 bg-gray-800 text-white rounded">x{col.settings.copies}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">₹{col.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                      ${col.status === 'Paid' ? 'bg-indigo-100 text-indigo-700' : 
                        col.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                        col.status === 'Payment Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {col.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={col.status} 
                      onChange={(e) => updateStatus(col._id, e.target.value)}
                      className="text-xs px-2 py-1.5 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 outline-none font-semibold transition-all focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Printing">Printing</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-medium">
                    No active orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
