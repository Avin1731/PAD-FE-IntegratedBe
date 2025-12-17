'use client';

import { useState, useEffect } from 'react';
import DeadlineCard from '@/components/DeadlineCard';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';

interface ApiDeadline {
  id: number;
  stage: string;
  deadline_at: string;
  year: number;
  catatan?: string;
}

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: true,
  onConfirm: () => {},
  confirmLabel: 'Ya',
  cancelLabel: 'Kembali',
};

// Helper Log
const logActivity = async (action: string, description: string) => {
  try {
    await axios.post('/api/logs', { action, description, role: 'pusdatin' });
  } catch (error) { console.error('Log failed', error); }
};

export default function PenerimaanDataPage() {
  const [deadline, setDeadline] = useState<ApiDeadline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const currentYear = new Date().getFullYear();

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    return dateString.split('T')[0].split('-').reverse().join('/');
  };

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await axios.get(`/api/pusdatin/penilaian/deadline/${currentYear}`);
        setDeadline(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil data deadline:', error);
      }
    };
    fetchDeadline();
  }, [currentYear]);

  const closeModal = () => { setIsModalOpen(false); };
  const resetModalConfig = () => { setModalConfig(INITIAL_MODAL_CONFIG); };

  const handleSave = async (newStartDate: string, newEndDate: string) => {
    if (isSaving) return;
    setIsSaving(true);

    const formattedDeadline = newEndDate.split('/').reverse().join('-') + 'T23:59:59';
    const payload = { 
      year: currentYear, 
      deadline_at: formattedDeadline,
      catatan: 'Deadline penerimaan data submission'
    };

    try {
      const response = await axios.post('/api/pusdatin/penilaian/deadline/set', payload);
      setDeadline(response.data.data);

      // --- LOGGING ---
      logActivity('Mengubah Deadline', `Mengubah jadwal submission tahun ${currentYear}`);

      setModalConfig({
        title: 'Berhasil',
        message: 'Deadline submission berhasil disimpan.',
        variant: 'success',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'Oke',
        cancelLabel: 'Tutup',
      });
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Gagal menyimpan deadline:', error);
      setModalConfig({
        title: 'Gagal',
        message: 'Gagal menyimpan deadline submission.',
        variant: 'danger',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'Tutup',
        cancelLabel: '',
      });
      setIsModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <span className="text-sm text-green-600 mb-4">Pengaturan Deadline</span> &gt; <span className="text-sm text-gray-600 mb-4">Deadline Submission</span>
      </div>
      <header>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Pengaturan Deadline Submission</h1>
        <p className="text-gray-600">Atur deadline penerimaan data dokumen dari DLH Provinsi dan Kab/Kota untuk tahun {currentYear}.</p>
      </header>
      
      <div className="max-w-xl">
        <DeadlineCard 
          title="Deadline Submission" 
          startDate="" 
          endDate={formatDate(deadline?.deadline_at)} 
          onSave={(_, end) => handleSave('', end)} 
          disabled={isSaving}
          hideStartDate={true}
        />
      </div>

      <UniversalModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onExitComplete={resetModalConfig} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        variant={modalConfig.variant} 
        showCancelButton={modalConfig.showCancelButton} 
        onConfirm={modalConfig.onConfirm} 
        confirmLabel={modalConfig.confirmLabel} 
        cancelLabel={modalConfig.cancelLabel} 
      />
    </div>
  );
}