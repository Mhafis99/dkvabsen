'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard-layout';
import { useSession } from 'next-auth/react';

interface Nilai {
  id: string;
  nilaiPraktik?: number;
  nilaiTeori?: number;
  nilaiAkhir?: number;
  keterangan?: string;
  jadwal: {
    mataBimbingan: string;
    tanggal: string;
    siswa: { nama: string; kelas: { namaKelas: string } };
  };
}

export default function GuruNilaiPage() {
  const { data: session } = useSession();
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNilai();
  }, []);

  const fetchNilai = async () => {
    try {
      const response = await fetch(`/api/nilai?guruId=${session?.user?.id}`);
      if (response.ok) setNilaiList(await response.json());
    } catch (error) {
      console.error('Error fetching nilai:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="guru">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Nilai</h1>
          <p className="text-muted-foreground mt-1">Riwayat penilaian bimbingan</p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <Card><CardContent className="py-8 text-center">Memuat data...</CardContent></Card>
          ) : nilaiList.length === 0 ? (
            <Card><CardContent className="py-8 text-center">Belum ada data nilai</CardContent></Card>
          ) : (
            nilaiList.map((nilai) => (
              <Card key={nilai.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{nilai.jadwal.mataBimbingan}</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Siswa: {nilai.jadwal.siswa.nama} ({nilai.jadwal.siswa.kelas.namaKelas})</p>
                        <p>Tanggal: {new Date(nilai.jadwal.tanggal).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Praktik</p>
                          <p className="font-semibold">{nilai.nilaiPraktik?.toFixed(1) || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Teori</p>
                          <p className="font-semibold">{nilai.nilaiTeori?.toFixed(1) || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Akhir</p>
                          <p className="font-semibold">{nilai.nilaiAkhir?.toFixed(1) || '-'}</p>
                        </div>
                      </div>
                      {nilai.keterangan && <p className="mt-2 text-sm text-muted-foreground">Catatan: {nilai.keterangan}</p>}
                    </div>
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
