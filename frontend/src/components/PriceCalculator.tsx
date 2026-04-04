"use client";

import { useMemo } from 'react';
import { IndianRupee } from 'lucide-react';

interface PriceCalculatorProps {
  totalPages: number;
  settings: {
    color: string;
    sides: string;
    copies: number;
    layout: string;
  };
}

export default function PriceCalculator({ totalPages, settings }: PriceCalculatorProps) {
  const price = useMemo(() => {
    if (totalPages === 0) return 0;
    
    let basePrice = settings.color === 'Color' ? 10 : 1;
    let sheetsNeeded = totalPages;

    if (settings.layout === '1/2') {
      sheetsNeeded = Math.ceil(totalPages / 2);
    } else if (settings.layout === '1/4') {
      sheetsNeeded = Math.ceil(totalPages / 4);
    }

    if (settings.sides === 'Double Side') {
      sheetsNeeded = Math.ceil(sheetsNeeded / 2);
    }

    return sheetsNeeded * basePrice * settings.copies;
  }, [totalPages, settings]);

  const timeString = useMemo(() => {
    if (totalPages === 0) return "0s";
    const totalSeconds = totalPages * settings.copies * 3;
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  }, [totalPages, settings]);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-t from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Estimated Total</div>
      <div className="flex items-center gap-1">
        <IndianRupee className="w-8 h-8 text-indigo-600" />
        <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          {price}
        </span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 w-full flex justify-between items-center text-sm">
        <span className="text-gray-500">Processing Time:</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">~{timeString}</span>
      </div>
    </div>
  );
}
