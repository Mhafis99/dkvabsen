'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard-layout';
import { useSession } from 'next-auth/react';

interface Jadwal {
  id: string;
  mataBimbingan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang?: string;
  topik?: string;
  status: string;
  siswa: { nama: string; kelas: { namaKelas: string } };
}

export default function GuruJadwalPage() {
  const { data: session } = useSession();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const response = await fetch(`/api/jadwal?guruId=${session?.user?.id}`);
      if (response.ok) setJadwalList(await response.json());
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="guru">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Bimbingan</h1>
          <p className="text-muted-foreground mt-1">Daftar jadwal bimbingan Anda</p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="py-8 text-center">Memuat data...</CardContent></Card>
          ) : jadwalList.length === 0 ? (
            <Card><CardContent className="py-8 text-center">Belum ada jadwal bimbingan</CardContent></Card>
          ) : (
            jadwalList.map((jadwal) => (
              <Card key={jadwal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{jadwal.mataBimbingan}</h3>
                      {jadwal.topik && <p className="text-sm text-muted-foreground">{jadwal.topik}</p>}
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Siswa: {jadwal.siswa.nama} ({jadwal.siswa.kelas.namaKelas})</p>
                        <p>Tanggal: {new Date(jadwal.tanggal).toLocaleDateString('id-ID')}</p>
                        <p>Waktu: {jadwal.jamMulai} - {jadwal.jamSelesai}</p>
                        {jadwal.ruang && <p>Ruang: {jadwal.ruang}</p>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      jadwal.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500' :
                      jadwal.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {jadwal.status === 'SCHEDULED' ? 'Terjadwal' : jadwal.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
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
