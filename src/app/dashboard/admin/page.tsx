'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Calendar, ClipboardCheck, Trophy } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const stats = [
    {
      title: 'Total Guru',
      value: '12',
      icon: Users,
      description: '+2 dari bulan lalu',
    },
    {
      title: 'Total Siswa',
      value: '156',
      icon: GraduationCap,
      description: '+15 dari bulan lalu',
    },
    {
      title: 'Total Kelas',
      value: '6',
      icon: Users,
      description: 'Semua aktif',
    },
    {
      title: 'Jadwal Bimbingan',
      value: '48',
      icon: Calendar,
      description: '8 jadwal hari ini',
    },
    {
      title: 'Absensi Bulan Ini',
      value: '95%',
      icon: ClipboardCheck,
      description: 'Rata-rata kehadiran',
    },
    {
      title: 'Nilai Rata-rata',
      value: '85.5',
      icon: Trophy,
      description: 'Skala 0-100',
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Selamat Datang, {session?.user?.name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas bimbingan hari ini
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Bimbingan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Bimbingan Praktik RPL {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Pak Budi - XII RPL 1
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">08:00 - 10:00</p>
                      <p className="text-xs text-muted-foreground">RPL 01</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistik Kehadiran Minggu Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(
                  (day, index) => (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{day}</span>
                        <span className="font-medium">
                          {90 + index * 2}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${90 + index * 2}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
