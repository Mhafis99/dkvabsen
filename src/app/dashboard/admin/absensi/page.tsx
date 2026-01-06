'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/dashboard-layout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Jadwal {
  id: string;
  mataBimbingan: string;
  tanggal: string;
  guru: { nama: string };
  siswa: { nama: string; kelas: { namaKelas: string } };
}

interface Absensi {
  id: string;
  jadwalId: string;
  guruId: string;
  siswaId: string;
  kehadiran: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';
  waktuMasuk?: string;
  waktuKeluar?: string;
  catatan?: string;
  jadwal: Jadwal;
}

export default function AbsensiManagementPage() {
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState<Absensi | null>(null);
  const [formData, setFormData] = useState({
    jadwalId: '',
    guruId: '',
    siswaId: '',
    kehadiran: 'HADIR' as const,
    catatan: '',
  });

  useEffect(() => {
    fetchAbsensi();
    fetchJadwal();
  }, []);

  const fetchAbsensi = async () => {
    try {
      const response = await fetch('/api/absensi');
      if (response.ok) setAbsensiList(await response.json());
    } catch (error) {
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const fetchJadwal = async () => {
    try {
      const response = await fetch('/api/jadwal');
      if (response.ok) {
        const data = await response.json();
        setJadwalList(data.filter((j: any) => j.status === 'COMPLETED'));
      }
    } catch (error) {
      toast.error('Gagal memuat data jadwal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingAbsensi ? '/api/absensi' : '/api/absensi';
      const method = editingAbsensi ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAbsensi ? { ...formData, id: editingAbsensi.id } : formData),
      });
      if (response.ok) {
        toast.success(editingAbsensi ? 'Data absensi berhasil diupdate' : 'Absensi berhasil ditambahkan');
        setDialogOpen(false);
        resetForm();
        fetchAbsensi();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan data absensi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (absensi: Absensi) => {
    setEditingAbsensi(absensi);
    setFormData({
      jadwalId: absensi.jadwalId,
      guruId: absensi.guruId,
      siswaId: absensi.siswaId,
      kehadiran: absensi.kehadiran,
      catatan: absensi.catatan || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus absensi ini?')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/absensi?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Absensi berhasil dihapus');
        fetchAbsensi();
      } else {
        toast.error('Gagal menghapus absensi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingAbsensi(null);
    setFormData({ jadwalId: '', guruId: '', siswaId: '', kehadiran: 'HADIR', catatan: '' });
  };

  const getKehadiranBadge = (status: string) => {
    const styles = {
      HADIR: 'bg-green-500/10 text-green-500',
      IZIN: 'bg-yellow-500/10 text-yellow-500',
      SAKIT: 'bg-blue-500/10 text-blue-500',
      ALPHA: 'bg-red-500/10 text-red-500',
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}>{status}</span>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Absensi</h1>
            <p className="text-muted-foreground mt-1">Kelola absensi bimbingan</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Absensi
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jadwal</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kehadiran</TableHead>
                <TableHead>Waktu Masuk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Memuat data...</TableCell></TableRow>
              ) : absensiList.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Tidak ada data absensi</TableCell></TableRow>
              ) : (
                absensiList.map((absensi) => (
                  <TableRow key={absensi.id}>
                    <TableCell>{absensi.jadwal.mataBimbingan}</TableCell>
                    <TableCell>{absensi.jadwal.guru.nama}</TableCell>
                    <TableCell>{absensi.jadwal.siswa.nama} ({absensi.jadwal.siswa.kelas.namaKelas})</TableCell>
                    <TableCell>{new Date(absensi.jadwal.tanggal).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{getKehadiranBadge(absensi.kehadiran)}</TableCell>
                    <TableCell>{absensi.waktuMasuk ? new Date(absensi.waktuMasuk).toLocaleTimeString('id-ID') : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(absensi)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(absensi.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAbsensi ? 'Edit Absensi' : 'Tambah Absensi'}</DialogTitle>
              <DialogDescription>{editingAbsensi ? 'Update absensi' : 'Isi data absensi baru'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Jadwal Bimbingan *</Label>
                  <Select value={formData.jadwalId} onValueChange={(v) => {
                    const jadwal = jadwalList.find(j => j.id === v);
                    setFormData({ ...formData, jadwalId: v, guruId: jadwal?.jadwalId || '', siswaId: jadwal?.siswaId || '' });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Pilih Jadwal" /></SelectTrigger>
                    <SelectContent>
                      {jadwalList.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.mataBimbingan} - {j.guru.nama} - {j.siswa.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kehadiran *</Label>
                  <Select value={formData.kehadiran} onValueChange={(v: any) => setFormData({ ...formData, kehadiran: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HADIR">Hadir</SelectItem>
                      <SelectItem value="IZIN">Izin</SelectItem>
                      <SelectItem value="SAKIT">Sakit</SelectItem>
                      <SelectItem value="ALPHA">Alpha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Input value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
