import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | XeroxWeb",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
