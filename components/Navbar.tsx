import Link from "next/link";
import { Home, MapPin } from "lucide-react";

export function Navbar() {
  const kosName = process.env.NEXT_PUBLIC_KOS_NAME ?? "Info Kos";
  const address = process.env.NEXT_PUBLIC_KOS_ADDRESS ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 hover:text-brand-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Home className="h-4 w-4" />
          </div>
          {kosName}
        </Link>
        {address && (
          <span className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
            <MapPin className="h-3 w-3" />
            {address}
          </span>
        )}
      </div>
    </header>
  );
}
