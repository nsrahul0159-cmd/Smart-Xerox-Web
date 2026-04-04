"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Suggestion {
  type: string;
  message: string;
  potentialSavings: boolean;
}

export default function AIOptimizerCard({ suggestions, onApply }: { suggestions: Suggestion[], onApply: (type: string) => void }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-100 dark:border-indigo-900"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-indigo-500" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200">AI Print Optimizer</h3>
      </div>
      
      <div className="space-y-3 relative z-10">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl backdrop-blur-sm shadow-sm border border-white/40 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{suggestion.message}</p>
            <button 
              onClick={() => onApply(suggestion.type)}
              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow hover:shadow-md whitespace-nowrap"
            >
              Apply to Save
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
