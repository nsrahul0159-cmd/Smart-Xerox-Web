import { Printer } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-b-0 rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
            XeroxWeb
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/track" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
            Track Order
          </Link>
          <Link href="/admin" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
