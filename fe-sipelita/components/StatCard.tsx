'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  bgColor?: string;
  borderColor?: string;
  titleColor?: string;
  valueColor?: string;
  // Tambahan optional className jika ingin override dari luar
  className?: string; 
}

export default function StatCard({
  title,
  value,
  bgColor = 'bg-gray-50', // Default ke abu-abu muda sesuai desain rincian skor
  borderColor = 'border-transparent',
  titleColor = 'text-gray-500',
  valueColor = 'text-gray-800',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`
        ${bgColor} ${borderColor} ${className}
        border rounded-lg p-4 text-center 
        h-full flex flex-col justify-center items-center
        transition-transform hover:scale-105 duration-200
      `}
    >
      <div className={`text-xs mb-1 ${titleColor}`}>{title}</div>
      <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}