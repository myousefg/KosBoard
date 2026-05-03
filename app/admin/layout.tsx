import Link from "next/link";
import { Home, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 flex-shrink-0 flex-col bg-white shadow-sm md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e1b4b] text-white">
            <Home className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-[#1e1b4b]">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-[#1e1b4b]"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/admin/kamar/tambah"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-[#1e1b4b]"
          >
            <PlusCircle className="h-4 w-4" /> Tambah Kamar
          </Link>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <span className="text-sm font-bold text-[#1e1b4b]">Admin Panel</span>
        <div className="flex items-center gap-1">
          <Link
            href="/admin"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/kamar/tambah"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            title="Tambah Kamar"
          >
            <PlusCircle className="h-4 w-4" />
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <main className="flex-1 overflow-auto pt-12 md:pt-0">
        <div className="mx-auto max-w-4xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}