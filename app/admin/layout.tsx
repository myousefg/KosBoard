import Link from "next/link";
import { Home, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col bg-white shadow-sm md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-bold text-brand-700 text-sm">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/admin/kamar"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            <Home className="h-4 w-4" /> Kelola Kamar
          </Link>
        </nav>
        <div className="border-t border-gray-100 p-3">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <span className="font-bold text-brand-700 text-sm">Admin Panel</span>
        <div className="flex gap-2">
          <Link href="/admin" className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100">
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <Link href="/admin/kamar" className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100">
            <Home className="h-4 w-4" />
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <main className="flex-1 overflow-auto pt-12 md:pt-0">
        <div className="mx-auto max-w-4xl p-6">{children}</div>
      </main>
    </div>
  );
}
