'use client';

import NotificationItem from './NotificationItem'; // Asumsikan NotificationItem tetap terpisah

interface NotificationCardProps {
  announcement?: string;
  notification?: string;
}

export default function NotificationCard({
  announcement,
  notification,
}: NotificationCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 min-h-[700px]">
      {/* <h3 className="text-sm font-semibold text-gray-800 mb-3">Notifikasi & Pengumuman</h3> */}
      <div className="space-y-3">
        {announcement && (
          <NotificationItem type="announcement" message={announcement} />
        )}
        {notification && (
          <NotificationItem type="notification" message={notification} />
        )}
      </div>
    </div>
  );
}