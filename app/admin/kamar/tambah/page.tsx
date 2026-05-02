import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KamarForm } from "@/components/KamarForm";

export default function TambahKamarPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/kamar"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Tambah Kamar Baru</h1>
        <p className="text-sm text-gray-400">Lengkapi informasi kamar yang akan ditambahkan</p>
      </div>
      <KamarForm />
    </div>
  );
}
