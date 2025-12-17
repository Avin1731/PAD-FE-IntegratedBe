'use client';

interface ProgressCardProps {
  stage: string;
  progress: number;
  detail: string;
  isCompleted?: boolean;
}

export default function ProgressCard({
  stage,
  progress,
  detail,
  isCompleted = false,
}: ProgressCardProps) {
  const progressColor = isCompleted ? 'bg-green-500' : 'bg-green-500';
  const statusColor = isCompleted ? 'text-green-600' : 'text-green-600';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-bold text-gray-800">{stage}</h3>
          <span className={`text-xs font-medium ${statusColor}`}>
            {progress}% Selesai
          </span>
        </div>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2">
        <div
          className={`h-2 ${progressColor} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
