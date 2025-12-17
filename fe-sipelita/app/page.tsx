// src/app/page.tsx
import SintaFullLogo from '@/components/SintaFullLogo.js';
import RoleSelectionCard from '@/components/RoleSelectionCard';

export default function Home() {
  // Semua role login di satu halaman /login
  // Backend akan handle role checking dan redirect sesuai role
  const buttons = [
    { name: 'Admin', href: '/login' }, 
    { name: 'Pusdatin', href: '/login' }, 
    { name: 'DLH', href: '/login' }, 
  ];

  return (
    <main 
      className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8" 
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 168, 107, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 168, 107, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      
      {/* Logo di luar card */}
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>

      {/* Panggil komponen Card Reusable */}
      <RoleSelectionCard
        title="Selamat datang di SIPELITA"
        subtitle="Silahkan pilih peran Anda terlebih dahulu"
        buttons={buttons.map(btn => ({ text: btn.name, href: btn.href }))} 
      />
    </main>
  );
}
