"use client";

import { Settings2 } from 'lucide-react';

interface PrintSettingsProps {
  settings: {
    color: string;
    sides: string;
    copies: number;
    layout: string;
  };
  onChange: (key: string, value: string | number) => void;
}

export default function PrintSettings({ settings, onChange }: PrintSettingsProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h3 className="font-semibold text-lg">Print Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Color Type</label>
          <div className="flex gap-2">
            {['B/W', 'Color'].map((type) => (
              <button
                key={type}
                onClick={() => onChange('color', type)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-all ${
                  settings.color === type 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sides</label>
          <div className="flex gap-2">
            {['Single Side', 'Double Side'].map((type) => (
              <button
                key={type}
                onClick={() => onChange('sides', type)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-all ${
                  settings.sides === type 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Layout</label>
          <div className="flex gap-2">
            {[ {label: 'Full (1)', val: '1'}, {label: '2 Per Sheet (1/2)', val: '1/2'}, {label: '4 Per Sheet (1/4)', val: '1/4'} ].map((item) => (
              <button
                key={item.val}
                onClick={() => onChange('layout', item.val)}
                className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-xl transition-all ${
                  settings.layout === item.val 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Copies</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onChange('copies', Math.max(1, settings.copies - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center font-medium text-lg"
            >-</button>
            <span className="font-semibold text-lg w-8 text-center">{settings.copies}</span>
            <button 
              onClick={() => onChange('copies', settings.copies + 1)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center font-medium text-lg"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
