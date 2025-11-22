// app/some-page/page.tsx
import UnderConstructionModal from "@/components/UnderConstructionModal";

export default function Page() {
  return (
    <>
      <div className="p-10">
        {/* Konten halaman boleh ada di sini */}
        <h1 className="text-xl font-bold">Under Construction</h1>
      </div>

      {/* Modal muncul otomatis */}
      <UnderConstructionModal
        title="Sedang Dalam Pengembangan"
        message="Fitur ini belum tersedia saat ini."
      />
    </>
  );
}
