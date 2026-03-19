import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GieoQuẻ.app — Gieo Quẻ Kinh Dịch Trực Tuyến",
  description:
    "Gieo quẻ Kinh Dịch theo phương pháp tung 3 đồng xu truyền thống. Nhận giải quẻ bằng AI kết hợp trí tuệ ngàn năm với công nghệ hiện đại.",
  keywords: ["Kinh Dịch", "gieo quẻ", "I Ching", "bói dịch", "quẻ dịch", "tung xu"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased bg-mystic-gradient min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
