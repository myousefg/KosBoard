import type { KamarStatus } from "@/types";

export function StatusBadge({ status }: { status: KamarStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        status === "kosong"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "kosong" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status === "kosong" ? "Tersedia" : "Terisi"}
    </span>
  );
}
