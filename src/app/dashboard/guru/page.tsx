'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ClipboardCheck, Trophy, Users } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { useEffect, useState } from 'react';

export default function GuruDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    jadwal: 0,
    siswa: 0,
    absensi: '0%',
    nilai: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jadwalRes, nilaiRes] = await Promise.all([
        fetch('/api/jadwal'),
        fetch('/api/nilai'),
      ]);

      if (jadwalRes.ok) {
        const jadwalData = await jadwalRes.json();
        const guruJadwal = Array.isArray(jadwalData) ? jadwalData.filter((j: any) => j.guruId === session?.user?.id) : [];
        setStats(prev => ({ ...prev, jadwal: guruJadwal.length }));
      }

      if (nilaiRes.ok) {
        const nilaiData = await nilaiRes.json();
        const guruNilai = Array.isArray(nilaiData) ? nilaiData.filter((n: any) => n.guruId === session?.user?.id) : [];
        const avgNilai = guruNilai.length > 0 ? guruNilai.reduce((acc: number, n: any) => acc + (n.nilaiAkhir || 0), 0) / guruNilai.length : 0;
        setStats(prev => ({ ...prev, nilai: avgNilai }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout role="guru">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Selamat Datang, {session?.user?.name || 'Guru'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas bimbingan Anda
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jadwal Bimbingan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jadwal}</div>
              <p className="text-xs text-muted-foreground mt-1">Total jadwal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Siswa Bimbingan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.siswa}</div>
              <p className="text-xs text-muted-foreground mt-1">Siswa aktif</p>
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
            <p className="text-muted-foreground">Belum ada jadwal untuk hari ini</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
