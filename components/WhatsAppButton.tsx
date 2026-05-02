"use client";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  kamarNama: string;
  className?: string;
  variant?: "full" | "icon";
}

export function WhatsAppButton({ kamarNama, className = "", variant = "full" }: WhatsAppButtonProps) {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    `Halo Bu, saya tertarik dengan ${kamarNama}. Apakah masih tersedia? Terima kasih 🙏`
  );
  const href = `https://wa.me/${waNumber}?text=${message}`;

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center rounded-full bg-green-500 p-3 text-white shadow-lg hover:bg-green-600 transition-colors ${className}`}
        aria-label="Hubungi via WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    );
  }

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
