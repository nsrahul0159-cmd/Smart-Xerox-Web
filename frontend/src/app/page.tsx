"use client";

import { useState, useEffect } from "react";
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import FileUpload from "@/components/FileUpload";
import PrintSettings from "@/components/PrintSettings";
import AIOptimizerCard from "@/components/AIOptimizerCard";
import PriceCalculator from "@/components/PriceCalculator";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [user, setUser] = useState({ name: '', phone: '' });
  
  const [settings, setSettings] = useState({
    color: 'B/W',
    sides: 'Single Side',
    copies: 1,
    layout: '1'
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    // Basic health check to see if we can reach the backend
    const checkApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        console.log('Testing connection to:', apiUrl);
        // The root URL points to the running message
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        await axios.get(baseUrl + '/');
        setApiStatus('ok');
        console.log('API is reachable!');
      } catch (err) {
        console.error('API health check failed:', err);
        setApiStatus('fail');
      }
    };
    checkApi();
  }, []);

  // Derive price logic on client locally for the QR
  const calculatePrice = () => {
    let basePrice = settings.color === 'Color' ? 10 : 1;
    let sheetsNeeded = totalPages;
    if (settings.layout === '1/2') sheetsNeeded = Math.ceil(totalPages / 2);
    else if (settings.layout === '1/4') sheetsNeeded = Math.ceil(totalPages / 4);
    if (settings.sides === 'Double Side') sheetsNeeded = Math.ceil(sheetsNeeded / 2);
    return sheetsNeeded * basePrice * settings.copies;
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
    setIsUploading(true);
    
    // Auto-upload
    const formData = new FormData();
    newFiles.forEach((f) => {
      // Explicitly passing the name helps some mobile browsers
      formData.append('files', f, f.name);
    });

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        timeout: 120000, // 2 minutes for slow mobile uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      });
      
      const sessionNewPages = res.data.totalPages;
      
      // Update state with new files and total page count
      setUploadedFiles(prev => [...prev, ...res.data.files]);
      
      let updatedTotal = 0;
      setTotalPages(prev => {
        updatedTotal = prev + sessionNewPages;
        return updatedTotal;
      });

      // Simple AI Logic based on the NEW total
      const newSuggestions = [];
      if (updatedTotal > 20 && settings.sides === 'Single Side') {
        newSuggestions.push({ type: 'sides', val: 'Double Side', message: 'Print double-sided to save 50% paper.' });
      }
      if (updatedTotal > 50 && settings.layout === '1') {
        newSuggestions.push({ type: 'layout', val: '1/2', message: 'Use 2 Pages per Sheet to drastically reduce cost.' });
      }
      if (settings.color === 'Color' && updatedTotal > 10) {
        newSuggestions.push({ type: 'color', val: 'B/W', message: 'If mostly text, B/W is 10x cheaper.' });
      }
      setSuggestions(newSuggestions);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      const targetUrl = process.env.NEXT_PUBLIC_API_URL || 'UNDEFINED';
      alert(`Error uploading files: ${errorMsg}\n\nTarget API: ${targetUrl}\nTechnical details: ${err.code || 'Check console'}. Please ensure the backend is running and reachable.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplySuggestion = (type: string, val: string) => {
    setSettings({ ...settings, [type]: val });
    setSuggestions(suggestions.filter(s => s.type !== type));
  };

  const handleFileRemove = (idx: number) => {
    const fileToRemove = uploadedFiles[idx];
    if (fileToRemove && fileToRemove.pages) {
      setTotalPages(prev => Math.max(0, prev - fileToRemove.pages));
    }
    
    const newFiles = [...files];
    newFiles.splice(idx, 1);
    setFiles(newFiles);
    
    const newUploadedFiles = [...uploadedFiles];
    newUploadedFiles.splice(idx, 1);
    setUploadedFiles(newUploadedFiles);
  };

  const handlePlaceOrder = async () => {
    if (!user.name || !user.phone || user.phone.length < 10) {
      alert("Please enter valid User Name and 10-digit Phone number.");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one PDF.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        user,
        files: uploadedFiles,
        totalPages,
        settings
      });
      setOrderCreated(res.data);
    } catch (err) {
      console.error(err);
      alert('Error placing order.');
    }
  };

  const handlePaymentSuccess = async () => {
    if (!orderCreated) return;
    
    setIsProcessing(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderCreated._id}/status`, { 
        status: 'Paid' 
      });
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Payment recorded but error updating status. Please refresh.');
      setPaymentSuccess(true); // Still show success for UX
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32">
      <div className="flex-1 space-y-8 min-w-0">
        {apiStatus === 'fail' && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div className="text-sm">
              <p className="font-bold">Backend Unreachable</p>
              <p>The app can't talk to the printer server. If you're on a phone, make sure you're on the same Wi-Fi or the URL is correct.</p>
            </div>
          </div>
        )}
        {/* User Info */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">User Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={user.name} 
              onChange={e => setUser({...user, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <input 
              type="tel" 
              placeholder="Phone Number (10 digits)" 
              value={user.phone} 
              maxLength={10}
              onChange={e => setUser({...user, phone: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </section>

        {/* Upload */}
        <section>
          <FileUpload 
            files={files} 
            onFilesAdded={handleFilesAdded} 
            onFileRemove={handleFileRemove} 
          />
          {isUploading && <p className="text-sm text-indigo-600 mt-2 animate-pulse">Uploading and processing PDFs...</p>}
        </section>

        {/* Print Settings */}
        <section>
          <PrintSettings 
            settings={settings} 
            onChange={(k, v) => setSettings({...settings, [k]: v})} 
          />
        </section>
      </div>

      {/* Sidebar Summary */}
      <div className="w-full lg:w-[380px] space-y-6">
        <AnimatePresence>
          {suggestions.length > 0 && (
            <AIOptimizerCard 
              suggestions={suggestions} 
              onApply={(type) => {
                const sug = suggestions.find(s => s.type === type);
                if (sug) handleApplySuggestion(type, sug.val);
              }} 
            />
          )}
        </AnimatePresence>

        <PriceCalculator totalPages={totalPages} settings={settings} />

        <button 
          onClick={handlePlaceOrder}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all focus:scale-[0.98]"
        >
          Proceed to Pay
        </button>

        <AnimatePresence>
          {orderCreated && !paymentSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-6 rounded-2xl flex flex-col items-center space-y-4 text-center mt-6"
            >
              <h3 className="font-bold text-lg text-emerald-600">Complete Payment</h3>
              <p className="text-sm text-gray-500">Order ID: {orderCreated.displayId || orderCreated._id.substring(0,8)}</p>
              
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Amount: ₹{calculatePrice()}
              </p>

              {/* Mobile: Direct UPI Payment Link */}
              <a 
                href={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'printshop@upi'}&pn=SmartPrintShop&am=${calculatePrice()}&tr=${orderCreated.displayId || orderCreated._id}`}
                onClick={handlePaymentSuccess}
                className="w-full md:hidden py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95"
              >
                💳 Pay with UPI App
              </a>

              {/* Desktop: QR Code Option */}
              <div className="hidden md:flex flex-col items-center space-y-3 w-full">
                <p className="text-xs text-gray-600 dark:text-gray-400">Scan with another device</p>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'printshop@upi'}&pn=SmartPrintShop&am=${calculatePrice()}&tr=${orderCreated.displayId || orderCreated._id}`} 
                    size={200} 
                  />
                </div>
              </div>

              {/* Mobile Fallback: Show QR Code too */}
              <div className="md:hidden pt-2 border-t border-gray-200 dark:border-slate-700 w-full">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Or scan with another device</p>
                <div className="p-3 bg-white rounded-lg shadow-sm flex justify-center">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'printshop@upi'}&pn=SmartPrintShop&am=${calculatePrice()}&tr=${orderCreated.displayId || orderCreated._id}`} 
                    size={150} 
                  />
                </div>
              </div>

              <button 
                onClick={handlePaymentSuccess}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-300 text-blue-700 disabled:text-gray-600 rounded-lg text-sm font-semibold transition-colors"
               >
                 {isProcessing ? 'Processing...' : 'Simulate Payment (Testing)'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paymentSuccess && orderCreated && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center space-y-6 text-center mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800"
            >
              {/* Success Checkmark Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-emerald-700 dark:text-emerald-400">Payment Successful! 🎉</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your order has been confirmed and payment received.</p>
              </div>

              {/* Order Details Card */}
              <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-4 space-y-3 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{orderCreated.displayId || orderCreated._id.substring(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                  <span className="font-bold text-lg text-gray-800 dark:text-gray-200">₹{calculatePrice()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pages:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold">✓ Paid</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="w-full bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">📋 Next Steps:</p>
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 text-left">
                  <li>✓ Go to <strong>Track Order</strong> to monitor your print status</li>
                  <li>✓ Your documents are queued for printing</li>
                  <li>✓ You'll be notified when ready for pickup</li>
                </ul>
              </div>

              <div className="w-full space-y-2">
                <button 
                  onClick={() => window.location.href = '/track'}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-95"
                >
                  📍 Track Your Order
                </button>
                <button 
                  onClick={() => {
                    setOrderCreated(null);
                    setPaymentSuccess(false);
                    setFiles([]);
                    setUploadedFiles([]);
                    setTotalPages(0);
                    setUser({ name: '', phone: '' });
                    setSuggestions([]);
                  }}
                  className="w-full py-2 px-4 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-all"
                >
                  ➕ Place Another Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
