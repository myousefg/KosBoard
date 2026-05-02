"use client";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  kamarNama: string;
  kosanNama?: string;
  whatsapp?: string;
  className?: string;
}

export function WhatsAppButton({ kamarNama, kosanNama, whatsapp, className = "" }: WhatsAppButtonProps) {
  const waNumber = whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    `Halo Bu Ida, saya tertarik dengan ${kamarNama}${kosanNama ? ` di ${kosanNama}` : ""}. Apakah masih tersedia? Terima kasih 🙏`
  );
  const href = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-green-600 active:scale-95 transition-all ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      Tanya via WhatsApp
    </a>
  );
}
