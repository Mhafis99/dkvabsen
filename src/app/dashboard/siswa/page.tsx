'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ClipboardCheck, Trophy } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { useEffect, useState } from 'react';

export default function SiswaDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    jadwal: 0,
    absensi: '0%',
    nilai: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jadwalRes, nilaiRes] = await Promise.all([
        fetch(`/api/jadwal?siswaId=${session?.user?.id}`),
        fetch(`/api/nilai?siswaId=${session?.user?.id}`),
      ]);

      if (jadwalRes.ok) {
        const jadwalData = await jadwalRes.json();
        const upcoming = Array.isArray(jadwalData) ? jadwalData.filter((j: any) => j.status === 'SCHEDULED') : [];
        setStats(prev => ({ ...prev, jadwal: upcoming.length }));
      }

      if (nilaiRes.ok) {
        const nilaiData = await nilaiRes.json();
        const avgNilai = Array.isArray(nilaiData) && nilaiData.length > 0
          ? nilaiData.reduce((acc: number, n: any) => acc + (n.nilaiAkhir || 0), 0) / nilaiData.length
          : 0;
        setStats(prev => ({ ...prev, nilai: avgNilai }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout role="siswa">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Selamat Datang, {session?.user?.name || 'Siswa'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan bimbingan Anda
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jadwal Mendatang</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jadwal}</div>
              <p className="text-xs text-muted-foreground mt-1">Jadwal aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kehadiran</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.absensi}</div>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata bulan ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nilai.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Skala 0-100</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal Bimbingan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Tidak ada jadwal untuk hari ini</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
