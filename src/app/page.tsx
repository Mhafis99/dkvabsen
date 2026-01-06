'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (role: string) => {
    if (!formData.email || !formData.password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: role,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login gagal. Periksa email dan password Anda.');
      } else {
        toast.success('Login berhasil!');
        router.push(`/dashboard/${role.toLowerCase()}`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Manajemen Uji Kompetensi
          </h1>
          <p className="text-muted-foreground">
            Sistem manajemen bimbingan dan penilaian
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masuk ke sistem dengan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="guru">Guru</TabsTrigger>
                <TabsTrigger value="siswa">Siswa</TabsTrigger>
              </TabsList>

              {['admin', 'guru', 'siswa'].map((role) => (
                <TabsContent key={role} value={role} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`email-${role}`}>Email</Label>
                    <Input
                      id={`email-${role}`}
                      type="email"
                      placeholder={`email${role}@sekolah.com`}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(role.toUpperCase());
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`password-${role}`}>Password</Label>
                    <Input
                      id={`password-${role}`}
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(role.toUpperCase());
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleSubmit(role.toUpperCase())}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      `Masuk sebagai ${role.charAt(0).toUpperCase() + role.slice(1)}`
                    )}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Gunakan akun demo untuk mencoba:</p>
          <p className="mt-1">Admin: admin@sekolah.com | Guru: guru@sekolah.com | Siswa: siswa@sekolah.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}
