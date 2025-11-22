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
  const backgroundColor = isCompleted ? 'bg-green-50' : 'bg-yellow-50';
  const statusColor = isCompleted ? 'text-green-600' : 'text-yellow-600';
  const progressColor = isCompleted ? 'bg-green-600' : 'bg-yellow-600';
  const borderColor = isCompleted ? 'border-green-300' : 'border-yellow-300';

  return (
    <div className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-transform hover:scale-105 border ${backgroundColor} ${borderColor}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{stage}</h3>
        <span className={`text-xs font-medium ${statusColor}`}>
          {isCompleted ? '100% Selesai' : `${progress}% Selesai`}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">{detail}</p>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${progressColor}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
