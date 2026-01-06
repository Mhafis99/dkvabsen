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
import { Plus, Edit, Trash2, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Guru {
  id: string;
  nip: string;
  nama: string;
  statusGuru: 'GURU_BIASA' | 'PEMBIMBING';
}

interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelas: {
    namaKelas: string;
  };
}

interface Jadwal {
  id: string;
  guruId: string;
  siswaId: string;
  mataBimbingan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang?: string;
  topik?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  catatan?: string;
  guru: Guru;
  siswa: Siswa;
}

export default function JadwalManagementPage() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    guruId: '',
    siswaId: '',
    mataBimbingan: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    ruang: '',
    topik: '',
    status: 'SCHEDULED' as const,
    catatan: '',
  });

  useEffect(() => {
    fetchJadwal();
    fetchGuru();
    fetchSiswa();
  }, [filterStatus]);

  const fetchJadwal = async () => {
    try {
      let url = '/api/jadwal';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJadwalList(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuru = async () => {
    try {
      const response = await fetch('/api/guru');
      if (response.ok) {
        const data = await response.json();
        setGuruList(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data guru');
    }
  };

  const fetchSiswa = async () => {
    try {
      const response = await fetch('/api/siswa');
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data siswa');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingJadwal ? '/api/jadwal' : '/api/jadwal';
      const method = editingJadwal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingJadwal ? { ...formData, id: editingJadwal.id } : formData),
      });

      if (response.ok) {
        toast.success(editingJadwal ? 'Data jadwal berhasil diupdate' : 'Jadwal baru berhasil ditambahkan');
        setDialogOpen(false);
        resetForm();
        fetchJadwal();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan data jadwal');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (jadwal: Jadwal) => {
    setEditingJadwal(jadwal);
    setFormData({
      guruId: jadwal.guruId,
      siswaId: jadwal.siswaId,
      mataBimbingan: jadwal.mataBimbingan,
      tanggal: new Date(jadwal.tanggal).toISOString().split('T')[0],
      jamMulai: jadwal.jamMulai,
      jamSelesai: jadwal.jamSelesai,
      ruang: jadwal.ruang || '',
      topik: jadwal.topik || '',
      status: jadwal.status,
      catatan: jadwal.catatan || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/jadwal?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Data jadwal berhasil dihapus');
        fetchJadwal();
      } else {
        toast.error('Gagal menghapus data jadwal');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingJadwal(null);
    setFormData({
      guruId: '',
      siswaId: '',
      mataBimbingan: '',
      tanggal: '',
      jamMulai: '',
      jamSelesai: '',
      ruang: '',
      topik: '',
      status: 'SCHEDULED',
      catatan: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-500/10 text-blue-500',
      COMPLETED: 'bg-green-500/10 text-green-500',
      CANCELLED: 'bg-red-500/10 text-red-500',
    };
    const labels = {
      SCHEDULED: 'Terjadwal',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredGuruList = guruList.filter((g) => g.statusGuru === 'PEMBIMBING');

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Jadwal Bimbingan</h1>
            <p className="text-muted-foreground mt-1">
              Kelola jadwal bimbingan
            </p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jadwal
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label htmlFor="filter">Filter Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mata Bimbingan</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Ruang</TableHead>
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
              ) : jadwalList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Tidak ada data jadwal
                  </TableCell>
                </TableRow>
              ) : (
                jadwalList.map((jadwal) => (
                  <TableRow key={jadwal.id}>
                    <TableCell className="font-medium">{jadwal.mataBimbingan}</TableCell>
                    <TableCell>{jadwal.guru.nama}</TableCell>
                    <TableCell>
                      {jadwal.siswa.nama}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({jadwal.siswa.kelas.namaKelas})
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {jadwal.jamMulai} - {jadwal.jamSelesai}
                    </TableCell>
                    <TableCell>{jadwal.ruang || '-'}</TableCell>
                    <TableCell>{getStatusBadge(jadwal.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(jadwal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(jadwal.id)}
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
                {editingJadwal ? 'Edit Jadwal Bimbingan' : 'Tambah Jadwal Bimbingan'}
              </DialogTitle>
              <DialogDescription>
                {editingJadwal ? 'Update jadwal bimbingan' : 'Isi data jadwal bimbingan baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guruId">Guru Pembimbing *</Label>
                    <Select
                      value={formData.guruId}
                      onValueChange={(value) => setFormData({ ...formData, guruId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Guru" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredGuruList.map((guru) => (
                          <SelectItem key={guru.id} value={guru.id}>
                            {guru.nama} ({guru.nip})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siswaId">Siswa *</Label>
                    <Select
                      value={formData.siswaId}
                      onValueChange={(value) => setFormData({ ...formData, siswaId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {siswaList.map((siswa) => (
                          <SelectItem key={siswa.id} value={siswa.id}>
                            {siswa.nama} ({siswa.kelas.namaKelas})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mataBimbingan">Mata Bimbingan *</Label>
                  <Input
                    id="mataBimbingan"
                    placeholder="Contoh: Praktik Pemrograman Web"
                    value={formData.mataBimbingan}
                    onChange={(e) => setFormData({ ...formData, mataBimbingan: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topik">Topik</Label>
                  <Input
                    id="topik"
                    placeholder="Contoh: Dasar HTML & CSS"
                    value={formData.topik}
                    onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal">Tanggal *</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ruang">Ruang</Label>
                    <Input
                      id="ruang"
                      placeholder="Contoh: RPL 01"
                      value={formData.ruang}
                      onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jamMulai">Jam Mulai *</Label>
                    <Input
                      id="jamMulai"
                      type="time"
                      value={formData.jamMulai}
                      onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jamSelesai">Jam Selesai *</Label>
                    <Input
                      id="jamSelesai"
                      type="time"
                      value={formData.jamSelesai}
                      onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                      <SelectItem value="COMPLETED">Selesai</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan</Label>
                  <Input
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
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
