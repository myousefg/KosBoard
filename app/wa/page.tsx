import { redirect } from "next/navigation";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6285317270088";
const PESAN = encodeURIComponent(
  "Halo Bu Ida, saya tertarik dengan kos di Permata Buah Batu. Boleh minta info kamar yang tersedia?"
);

export default function WARedirectPage() {
  redirect(`https://wa.me/${WA_NUMBER}?text=${PESAN}`);
}