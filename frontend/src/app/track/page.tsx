"use client";

import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';

export default function TrackOrder() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/track/${phone}`);
      setOrders(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      alert("Failed to track orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          Track Your Orders
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Enter your phone number to check current status.</p>
      </div>

      <form onSubmit={handleSearch} className="glass-panel p-6 rounded-2xl flex gap-4 items-center">
        <div className="relative flex-1">
          <input 
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all text-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Track
        </button>
      </form>

      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {orders.length} Order(s) Found
          </h2>
          {orders.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-gray-500">
              No orders found for this phone number.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Order ID: <span className="font-mono text-gray-800 dark:text-gray-300">{order.displayId || order._id.substring(order._id.length - 8)}</span></p>
                    <p className="font-medium mt-1">{order.files?.length || 0} File(s) • {order.totalPages} Pages</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    {/* File names preview */}
                    <div className="mt-2 flex flex-col gap-1">
                      {order.files?.slice(0, 2).map((file: any, i: number) => (
                         <span key={i} className="text-xs text-gray-500 truncate w-48">- {file.originalName}</span>
                      ))}
                      {order.files?.length > 2 && <span className="text-xs text-indigo-500">+{order.files.length - 2} more files</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">₹{order.amount}</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${order.status === 'Paid' ? 'bg-indigo-100 text-indigo-700' : 
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'Delivered' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'Payment Pending' ? 'bg-amber-100 text-amber-700' : 
                        order.status === 'Printing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
