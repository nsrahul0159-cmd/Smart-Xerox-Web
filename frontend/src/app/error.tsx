"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-6">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Something went wrong!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We apologize for the inconvenience. An unexpected error occurred while processing your request. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
      >
        Try again
      </button>
    </div>
  );
}
