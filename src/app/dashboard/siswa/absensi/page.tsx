'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard-layout';
import { useSession } from 'next-auth/react';

interface Absensi {
  id: string;
  kehadiran: string;
  waktuMasuk?: string;
  catatan?: string;
  jadwal: {
    mataBimbingan: string;
    tanggal: string;
    guru: { nama: string };
  };
}

export default function SiswaAbsensiPage() {
  const { data: session } = useSession();
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const fetchAbsensi = async () => {
    try {
      const response = await fetch(`/api/absensi?siswaId=${session?.user?.id}`);
      if (response.ok) setAbsensiList(await response.json());
    } catch (error) {
      console.error('Error fetching absensi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="siswa">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Absensi</h1>
          <p className="text-muted-foreground mt-1">Riwayat kehadiran bimbingan Anda</p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="py-8 text-center">Memuat data...</CardContent></Card>
          ) : absensiList.length === 0 ? (
            <Card><CardContent className="py-8 text-center">Belum ada data absensi</CardContent></Card>
          ) : (
            absensiList.map((absensi) => (
              <Card key={absensi.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{absensi.jadwal.mataBimbingan}</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Guru: {absensi.jadwal.guru.nama}</p>
                        <p>Tanggal: {new Date(absensi.jadwal.tanggal).toLocaleDateString('id-ID')}</p>
                        {absensi.waktuMasuk && <p>Masuk: {new Date(absensi.waktuMasuk).toLocaleTimeString('id-ID')}</p>}
                        {absensi.catatan && <p>Catatan: {absensi.catatan}</p>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      absensi.kehadiran === 'HADIR' ? 'bg-green-500/10 text-green-500' :
                      absensi.kehadiran === 'IZIN' ? 'bg-yellow-500/10 text-yellow-500' :
                      absensi.kehadiran === 'SAKIT' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {absensi.kehadiran}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
