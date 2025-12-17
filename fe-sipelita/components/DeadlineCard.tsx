'use client';

import { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';

// Import CSS untuk datepicker
import 'react-datepicker/dist/react-datepicker.css';

interface DeadlineCardProps {
  title: string;
  startDate: string; 
  endDate: string;
  onSave: (start: string, end: string) => void;
  disabled?: boolean;
  hideStartDate?: boolean; // Untuk menyembunyikan input tanggal mulai
}

// --- FUNGSI PARSE DATE ---
const parseDate = (dateString: string): Date | null => {
    // ... (Logika parseDate Anda tidak berubah)
    if (!dateString) return null;
    let cleanDate = dateString;
    if (dateString.includes('T') && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length >= 2) {
            const lastPart = parts[parts.length - 2] + '/' + parts[parts.length - 1];
            if (lastPart.match(/^\d{1,2}\/\d{4}$/)) {
                cleanDate = `01/${lastPart}`;
            } else {
                const match = dateString.match(/(\d{1,2})\/(\d{4})$/);
                if (match) {
                    cleanDate = `01/${match[1]}/${match[2]}`;
                }
            }
        }
    }
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months 0-based
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
        return isoDate;
    }
    return null;
};

// --- FUNGSI FORMAT DATE ---
const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export default function DeadlineCard({
  title,
  startDate,
  endDate,
  onSave,
  disabled = false,
  hideStartDate = false,
}: DeadlineCardProps) {
  // State untuk DatePicker (kalender)
  const [localStart, setLocalStart] = useState<Date | null>(parseDate(startDate));
  const [localEnd, setLocalEnd] = useState<Date | null>(parseDate(endDate));
  
  const [inputStart, setInputStart] = useState('');
  const [inputEnd, setInputEnd] = useState('');

  const datePickerStartRef = useRef<DatePicker>(null);
  const datePickerEndRef = useRef<DatePicker>(null);

  // useEffect tidak berubah, ini sudah benar
  useEffect(() => {
    setTimeout(() => {
      const parsedStart = parseDate(startDate);
      setLocalStart(parsedStart);
      // HAPUS: setInputStart(parsedStart ? formatDate(parsedStart) : '');

      const parsedEnd = parseDate(endDate);
      setLocalEnd(parsedEnd);
      // HAPUS: setInputEnd(parsedEnd ? formatDate(parsedEnd) : '');
    }, 0);
  }, [startDate, endDate]);

  const formatInput = (value: string): string => {
    // ... (logika formatInput tidak berubah)
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    if (numbers.length <= 2) {
      formatted = numbers;
    } else if (numbers.length <= 4) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
    return formatted;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatInput(e.target.value);
    setInputStart(value);
    if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = value.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        setLocalStart(date);
      }
    } else {
      setLocalStart(null);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatInput(e.target.value);
    setInputEnd(value);
    if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = value.split('/');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        setLocalEnd(date);
      }
    } else {
      setLocalEnd(null);
    }
  };

  const handleSave = () => {
    // Kirim nilai dari input teks
    onSave(inputStart, inputEnd);
  };

  const handleIconClickStart = () => {
    // 3. Jangan buka jika disabled
    if (disabled) return;
    if (datePickerStartRef.current) {
      datePickerStartRef.current.setOpen(true);
    }
  };

  const handleIconClickEnd = () => {
    // 3. Jangan buka jika disabled
    if (disabled) return;
    if (datePickerEndRef.current) {
      datePickerEndRef.current.setOpen(true);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {/* Judul Card */}
        <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
        
        {/* Input Tanggal Mulai - Conditional render */}
        {!hideStartDate && (
          <div className="mb-3">
            <label className="block text-sm text-gray-700 mb-0.5">Tanggal Mulai</label>
            <div className="relative">
              <input
                type="text"
                value={inputStart}
                onChange={handleStartChange}
                disabled={disabled}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="DD/MM/YYYY"
                maxLength={10}
              />
              <FaCalendarAlt
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00A86B] text-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={handleIconClickStart}
              />
              <DatePicker
                ref={datePickerStartRef}
                selected={localStart}
                onChange={(date) => {
                  setLocalStart(date);
                  setInputStart(formatDate(date));
                }}
                dateFormat="dd/MM/yyyy"
                showPopperArrow={false}
                className="hidden"
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* Input Tanggal Selesai */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-0.5">Tanggal Selesai</label>
          <div className="relative">
            <input
              type="text"
              value={inputEnd}
              onChange={handleEndChange}
              disabled={disabled} // <-- 5. Terapkan disabled
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B] focus:border-transparent placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed" // <-- Tambah style disabled
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
            <FaCalendarAlt
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00A86B] text-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} // <-- Tambah style disabled
              onClick={handleIconClickEnd}
            />
            <DatePicker
              ref={datePickerEndRef}
              selected={localEnd}
              onChange={(date) => {
                setLocalEnd(date);
                setInputEnd(formatDate(date));
              }}
              dateFormat="dd/MM/yyyy"
              showPopperArrow={false}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Tombol Simpan Perubahan */}
        <button
          onClick={handleSave}
          disabled={disabled} // <-- 5. Terapkan disabled
          className="w-full bg-[#00A86B] hover:bg-[#00945F] text-white font-medium text-sm py-1.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" // <-- Tambah style disabled
        >
          {disabled ? 'Menyimpan...' : 'Simpan'}
        </button>
    </div>
  );
}