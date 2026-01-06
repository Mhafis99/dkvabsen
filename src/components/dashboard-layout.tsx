'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  Trophy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
}

const adminNavItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/admin/guru', icon: Users, label: 'Data Guru' },
  { href: '/dashboard/admin/siswa', icon: GraduationCap, label: 'Data Siswa' },
  { href: '/dashboard/admin/kelas', icon: Users, label: 'Data Kelas' },
  { href: '/dashboard/admin/jadwal', icon: Calendar, label: 'Jadwal Bimbingan' },
  { href: '/dashboard/admin/absensi', icon: ClipboardCheck, label: 'Absensi' },
  { href: '/dashboard/admin/nilai', icon: Trophy, label: 'Nilai' },
];

const guruNavItems = [
  { href: '/dashboard/guru', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/guru/jadwal', icon: Calendar, label: 'Jadwal Bimbingan' },
  { href: '/dashboard/guru/absensi', icon: ClipboardCheck, label: 'Absensi' },
  { href: '/dashboard/guru/nilai', icon: Trophy, label: 'Nilai' },
];

const siswaNavItems = [
  { href: '/dashboard/siswa', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/siswa/jadwal', icon: Calendar, label: 'Jadwal Bimbingan' },
  { href: '/dashboard/siswa/absensi', icon: ClipboardCheck, label: 'Riwayat Absensi' },
  { href: '/dashboard/siswa/nilai', icon: Trophy, label: 'Nilai Bimbingan' },
];

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return adminNavItems;
      case 'guru':
        return guruNavItems;
      case 'siswa':
        return siswaNavItems;
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = getNavItems();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <span className="font-semibold">Dashboard {roleLabel}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-0
        `}
      >
        <ScrollArea className="h-full py-4 px-3">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <h2 className="text-2xl font-bold text-primary mb-1">
                Uji Kompetensi
              </h2>
              <p className="text-sm text-muted-foreground">Dashboard {roleLabel}</p>
            </div>

            <Separator />

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <Separator />

            <div className="px-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Keluar
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
