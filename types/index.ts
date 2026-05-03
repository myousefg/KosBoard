export type KamarStatus = "kosong" | "terisi";

export interface Kosan {
  id: string;
  nama: string;
  slug: string;
  alamat: string;
  whatsapp: string;
  created_at: string;
}

export interface Harga {
  id: string;
  kamar_id: string;
  durasi: string;
  harga: number;
  keterangan: string | null;
  urutan: number;
}

export interface Kamar {
  id: string;
  kosan_id: string;
  nama: string;
  deskripsi: string | null;
  status: KamarStatus;
  luas: string | null;
  lantai: number | null;
  fasilitas: string[] | null;
  foto_urls: string[] | null;
  urutan: number;
  tanggal_keluar: string | null; // ← kolom baru (format: "YYYY-MM-DD")
  created_at: string;
  updated_at: string;
  harga?: Harga[];
}

export interface KamarWithHarga extends Kamar {
  harga: Harga[];
}