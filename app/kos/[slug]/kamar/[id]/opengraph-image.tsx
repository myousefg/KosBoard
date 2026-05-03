import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type { KamarWithHarga, Kosan } from "@/types";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase
    .from("kosan")
    .select("*")
    .eq("slug", slug)
    .single();

  const { data } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .eq("id", id)
    .maybeSingle();

  const kamar = data as KamarWithHarga | null;
  const k = kosan as Kosan | null;

  const nama = kamar?.nama ?? "Kamar Kos";
  const kosanNama = k?.nama ?? "Kos Bu Ida";
  const status = kamar?.status ?? "kosong";
  const luas = kamar?.luas ?? null;
  const lantai = kamar?.lantai ?? null;
  const fasilitas = (kamar?.fasilitas ?? []).slice(0, 4);
  const coverPhoto = kamar?.foto_urls?.[0] ?? null;

  const hargaSorted = [...(kamar?.harga ?? [])].sort((a, b) => a.harga - b.harga);
  const hargaMin = hargaSorted[0] ?? null;

  const isKosong = status === "kosong";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          fontFamily: "sans-serif",
          backgroundColor: "#F8F7F4",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left — foto */}
        <div
          style={{
            width: "520px",
            height: "630px",
            flexShrink: 0,
            position: "relative",
            backgroundColor: "#e2e0db",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPhoto}
              alt={nama}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            /* placeholder ilustrasi kamar */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <svg
                width="96"
                height="96"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* dinding + atap */}
                <path
                  d="M8 30L32 10L56 30V58H8V30Z"
                  fill="#1e1b4b"
                  opacity="0.15"
                />
                <path
                  d="M8 30L32 10L56 30"
                  stroke="#1e1b4b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
                {/* pintu */}
                <rect
                  x="26"
                  y="42"
                  width="12"
                  height="16"
                  rx="2"
                  fill="#1e1b4b"
                  opacity="0.2"
                />
                <circle cx="35.5" cy="50.5" r="1" fill="#1e1b4b" opacity="0.4" />
                {/* jendela kiri */}
                <rect
                  x="13"
                  y="36"
                  width="10"
                  height="10"
                  rx="1.5"
                  fill="#1e1b4b"
                  opacity="0.2"
                />
                <line
                  x1="18"
                  y1="36"
                  x2="18"
                  y2="46"
                  stroke="#1e1b4b"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="13"
                  y1="41"
                  x2="23"
                  y2="41"
                  stroke="#1e1b4b"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* jendela kanan */}
                <rect
                  x="41"
                  y="36"
                  width="10"
                  height="10"
                  rx="1.5"
                  fill="#1e1b4b"
                  opacity="0.2"
                />
                <line
                  x1="46"
                  y1="36"
                  x2="46"
                  y2="46"
                  stroke="#1e1b4b"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="41"
                  y1="41"
                  x2="51"
                  y2="41"
                  stroke="#1e1b4b"
                  strokeWidth="1"
                  opacity="0.3"
                />
              </svg>
              <span
                style={{ fontSize: "14px", color: "#9ca3af", letterSpacing: "0.05em" }}
              >
                Belum ada foto
              </span>
            </div>
          )}

          {/* overlay gradient kiri→kanan */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "80px",
              height: "100%",
              background:
                "linear-gradient(to right, transparent, #F8F7F4)",
            }}
          />
        </div>

        {/* Right — info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "48px 52px 48px 44px",
            gap: "0",
          }}
        >
          {/* logo / brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#1e1b4b",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
              </svg>
            </div>
            <span style={{ fontSize: "15px", color: "#6b7280", fontWeight: 500 }}>
              {kosanNama}
            </span>
          </div>

          {/* nama kamar */}
          <div
            style={{
              fontSize: "46px",
              fontWeight: 700,
              color: "#1e1b4b",
              lineHeight: 1.1,
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            {nama}
          </div>

          {/* meta — luas & lantai */}
          {(luas || lantai) && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {luas && (
                <span style={{ fontSize: "16px", color: "#6b7280" }}>
                  {luas}
                </span>
              )}
              {lantai && (
                <span style={{ fontSize: "16px", color: "#6b7280" }}>
                  Lantai {lantai}
                </span>
              )}
            </div>
          )}

          {/* status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: isKosong ? "#dcfce7" : "#fee2e2",
                color: isKosong ? "#166534" : "#991b1b",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isKosong ? "#16a34a" : "#dc2626",
                }}
              />
              {isKosong ? "Tersedia" : "Terisi"}
            </div>
          </div>

          {/* fasilitas */}
          {fasilitas.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {fasilitas.map((f) => (
                <span
                  key={f}
                  style={{
                    backgroundColor: "#eef2ff",
                    color: "#3730a3",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#e5e7eb",
              marginBottom: "20px",
            }}
          />

          {/* harga */}
          {hargaMin ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                Mulai dari
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#1e1b4b",
                    lineHeight: 1,
                  }}
                >
                  {formatRupiah(hargaMin.harga)}
                </span>
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                  /{hargaMin.durasi.toLowerCase()}
                </span>
              </div>
            </div>
          ) : null}

          {/* footer domain */}
          <div
            style={{
              marginTop: "auto",
              fontSize: "13px",
              color: "#9ca3af",
            }}
          >
            kosanboard.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}