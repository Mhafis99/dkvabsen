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

interface Nilai {
  id: string;
  jadwalId: string;
  guruId: string;
  siswaId: string;
  nilaiPraktik?: number;
  nilaiTeori?: number;
  nilaiAkhir?: number;
  keterangan?: string;
  jadwal: Jadwal;
}

export default function NilaiManagementPage() {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNilai, setEditingNilai] = useState<Nilai | null>(null);
  const [formData, setFormData] = useState({
    jadwalId: '',
    guruId: '',
    siswaId: '',
    nilaiPraktik: '',
    nilaiTeori: '',
    keterangan: '',
  });

  useEffect(() => {
    fetchNilai();
    fetchJadwal();
  }, []);

  const fetchNilai = async () => {
    try {
      const response = await fetch('/api/nilai');
      if (response.ok) setNilaiList(await response.json());
    } catch (error) {
      toast.error('Gagal memuat data nilai');
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
      const url = editingNilai ? '/api/nilai' : '/api/nilai';
      const method = editingNilai ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNilai ? { ...formData, id: editingNilai.id } : formData),
      });
      if (response.ok) {
        toast.success(editingNilai ? 'Data nilai berhasil diupdate' : 'Nilai berhasil ditambahkan');
        setDialogOpen(false);
        resetForm();
        fetchNilai();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan data nilai');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nilai: Nilai) => {
    setEditingNilai(nilai);
    setFormData({
      jadwalId: nilai.jadwalId,
      guruId: nilai.guruId,
      siswaId: nilai.siswaId,
      nilaiPraktik: nilai.nilaiPraktik?.toString() || '',
      nilaiTeori: nilai.nilaiTeori?.toString() || '',
      keterangan: nilai.keterangan || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus nilai ini?')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/nilai?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Nilai berhasil dihapus');
        fetchNilai();
      } else {
        toast.error('Gagal menghapus nilai');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingNilai(null);
    setFormData({ jadwalId: '', guruId: '', siswaId: '', nilaiPraktik: '', nilaiTeori: '', keterangan: '' });
  };

  const getNilaiBadge = (nilai?: number) => {
    if (!nilai) return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/10 text-gray-500">-</span>;
    let color = 'bg-red-500/10 text-red-500';
    if (nilai >= 70) color = 'bg-yellow-500/10 text-yellow-500';
    if (nilai >= 85) color = 'bg-green-500/10 text-green-500';
    return <span className={`px-2 py-1 rounded-full text-xs ${color}`}>{nilai.toFixed(1)}</span>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Nilai</h1>
            <p className="text-muted-foreground mt-1">Kelola nilai bimbingan</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Nilai
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
                <TableHead>Nilai Praktik</TableHead>
                <TableHead>Nilai Teori</TableHead>
                <TableHead>Nilai Akhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Memuat data...</TableCell></TableRow>
              ) : nilaiList.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Tidak ada data nilai</TableCell></TableRow>
              ) : (
                nilaiList.map((nilai) => (
                  <TableRow key={nilai.id}>
                    <TableCell>{nilai.jadwal.mataBimbingan}</TableCell>
                    <TableCell>{nilai.jadwal.guru.nama}</TableCell>
                    <TableCell>{nilai.jadwal.siswa.nama} ({nilai.jadwal.siswa.kelas.namaKelas})</TableCell>
                    <TableCell>{new Date(nilai.jadwal.tanggal).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{getNilaiBadge(nilai.nilaiPraktik)}</TableCell>
                    <TableCell>{getNilaiBadge(nilai.nilaiTeori)}</TableCell>
                    <TableCell>{getNilaiBadge(nilai.nilaiAkhir)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(nilai)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(nilai.id)}><Trash2 className="h-4 w-4" /></Button>
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
              <DialogTitle>{editingNilai ? 'Edit Nilai' : 'Tambah Nilai'}</DialogTitle>
              <DialogDescription>{editingNilai ? 'Update nilai' : 'Isi data nilai baru'}</DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nilai Praktik (0-100)</Label>
                    <Input type="number" min="0" max="100" value={formData.nilaiPraktik} onChange={(e) => setFormData({ ...formData, nilaiPraktik: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai Teori (0-100)</Label>
                    <Input type="number" min="0" max="100" value={formData.nilaiTeori} onChange={(e) => setFormData({ ...formData, nilaiTeori: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Keterangan</Label>
                  <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
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
