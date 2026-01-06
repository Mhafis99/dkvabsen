'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard-layout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Guru {
  id: string;
  nip: string;
  nama: string;
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN';
  statusGuru: 'GURU_BIASA' | 'PEMBIMBING';
  noTelepon?: string;
  alamat?: string;
  isActive: boolean;
  user: {
    email: string;
    name: string;
  };
}

export default function GuruManagementPage() {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nip: '',
    nama: '',
    jenisKelamin: 'LAKI_LAKI',
    statusGuru: 'GURU_BIASA',
    noTelepon: '',
    alamat: '',
  });

  useEffect(() => {
    fetchGurus();
  }, []);

  const fetchGurus = async () => {
    try {
      const response = await fetch('/api/guru');
      if (response.ok) {
        const data = await response.json();
        setGurus(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data guru');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingGuru ? '/api/guru' : '/api/guru';
      const method = editingGuru ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGuru ? { ...formData, id: editingGuru.id } : formData),
      });

      if (response.ok) {
        toast.success(editingGuru ? 'Data guru berhasil diupdate' : 'Guru baru berhasil ditambahkan');
        setDialogOpen(false);
        resetForm();
        fetchGurus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan data guru');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setFormData({
      email: guru.user.email,
      password: '',
      nip: guru.nip,
      nama: guru.nama,
      jenisKelamin: guru.jenisKelamin,
      statusGuru: guru.statusGuru,
      noTelepon: guru.noTelepon || '',
      alamat: guru.alamat || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/guru?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Data guru berhasil dihapus');
        fetchGurus();
      } else {
        toast.error('Gagal menghapus data guru');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingGuru(null);
    setFormData({
      email: '',
      password: '',
      nip: '',
      nama: '',
      jenisKelamin: 'LAKI_LAKI',
      statusGuru: 'GURU_BIASA',
      noTelepon: '',
      alamat: '',
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Data Guru</h1>
            <p className="text-muted-foreground mt-1">
              Kelola data guru dan pembimbing
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Guru
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : gurus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Tidak ada data guru
                  </TableCell>
                </TableRow>
              ) : (
                gurus.map((guru) => (
                  <TableRow key={guru.id}>
                    <TableCell className="font-medium">{guru.nip}</TableCell>
                    <TableCell>{guru.nama}</TableCell>
                    <TableCell>{guru.user.email}</TableCell>
                    <TableCell>
                      {guru.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        guru.statusGuru === 'PEMBIMBING'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {guru.statusGuru === 'PEMBIMBING' ? 'Pembimbing' : 'Guru Biasa'}
                      </span>
                    </TableCell>
                    <TableCell>{guru.noTelepon || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        guru.isActive
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {guru.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(guru)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(guru.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingGuru ? 'Update informasi guru' : 'Isi data guru baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingGuru}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password {editingGuru ? '(kosongkan jika tidak diubah)' : '*'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingGuru}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP *</Label>
                    <Input
                      id="nip"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jenisKelamin">Jenis Kelamin *</Label>
                    <Select
                      value={formData.jenisKelamin}
                      onValueChange={(value: any) => setFormData({ ...formData, jenisKelamin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                        <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusGuru">Status Guru *</Label>
                    <Select
                      value={formData.statusGuru}
                      onValueChange={(value: any) => setFormData({ ...formData, statusGuru: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GURU_BIASA">Guru Biasa</SelectItem>
                        <SelectItem value="PEMBIMBING">Pembimbing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noTelepon">No. Telepon</Label>
                  <Input
                    id="noTelepon"
                    value={formData.noTelepon}
                    onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
