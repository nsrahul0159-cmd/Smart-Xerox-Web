import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-4 bg-indigo-50 dark:bg-slate-800 text-indigo-400 rounded-full mb-6">
        <SearchX className="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-black mb-4 text-gray-800 dark:text-gray-100">
        Page Not Found
      </h2>
      <p className="text-gray-500 mb-8 max-w-md text-lg">
        The page you are looking for doesn't exist or has been moved. Let's get you back.
      </p>
      <Link href="/">
        <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-xl transition-transform active:scale-95">
          Return to Printing
        </button>
      </Link>
    </div>
  );
}
