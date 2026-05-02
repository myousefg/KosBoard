export type KamarStatus = "kosong" | "terisi";

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
  nama: string;
  deskripsi: string | null;
  status: KamarStatus;
  luas: string | null;
  lantai: number | null;
  fasilitas: string[] | null;
  foto_urls: string[] | null;
  created_at: string;
  updated_at: string;
  harga?: Harga[];
}

export interface KamarWithHarga extends Kamar {
  harga: Harga[];
}
