import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XeroxWeb | Premium Print Optimizer",
  description: "Smart print shop application for uploading PDFs and optimizing print costs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col selection:bg-indigo-500/30`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <Header />
        <main className="flex-1 flex flex-col mt-16 px-4 md:px-8 py-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
