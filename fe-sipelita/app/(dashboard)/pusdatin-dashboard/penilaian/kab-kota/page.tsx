'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PenilaianKabKotaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pusdatin-dashboard/penilaian');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}