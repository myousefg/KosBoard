"use client";
import { Share2 } from "lucide-react";

export function ShareButton({ kamarNama }: { kamarNama: string }) {
  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: kamarNama, text: `Cek kamar kos ini: ${kamarNama}`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link sudah disalin!");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
    >
      <Share2 className="h-3.5 w-3.5" />
      Bagikan
    </button>
  );
}