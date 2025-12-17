// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pad-Sipelita", // Anda bisa ganti judulnya di sini
  description: "Sistem Informasi Penilaian Nirwasita Tantra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ErrorBoundary fallback={
            <div className="w-full sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
              <div className="text-sm text-red-600">Navbar error - refresh halaman</div>
            </div>
          }>
            <Header /> {/* <-- HEADER */}
          </ErrorBoundary>

          {/* Children (konten halaman) */}
          {children}

          <Footer /> {/* <-- FOOTER */}
        </AuthProvider>
      </body>
    </html>
  );
}