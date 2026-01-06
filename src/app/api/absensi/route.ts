import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const siswaId = searchParams.get('siswaId');
    const jadwalId = searchParams.get('jadwalId');

    if (id) {
      const absensi = await db.absensiBimbingan.findUnique({
        where: { id },
        include: { jadwal: { include: { guru: true, siswa: { include: { kelas: true } } } } },
      });
      if (!absensi) return NextResponse.json({ error: 'Absensi not found' }, { status: 404 });
      return NextResponse.json(absensi);
    }

    const where: any = {};
    if (siswaId) where.siswaId = siswaId;
    if (jadwalId) where.jadwalId = jadwalId;

    const absensiList = await db.absensiBimbingan.findMany({
      where,
      include: { jadwal: { include: { guru: true, siswa: { include: { kelas: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(absensiList);
  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json({ error: 'Failed to fetch absensi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { jadwalId, guruId, siswaId, kehadiran, catatan } = body;

    if (!jadwalId || !guruId || !siswaId || !kehadiran) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jadwal = await db.jadwalBimbingan.findUnique({ where: { id: jadwalId } });
    if (!jadwal) return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });

    const absensi = await db.absensiBimbingan.create({
      data: {
        jadwalId,
        guruId,
        siswaId,
        kehadiran,
        catatan,
        waktuMasuk: kehadiran === 'HADIR' ? new Date() : null,
      },
      include: { jadwal: true },
    });

    return NextResponse.json(absensi, { status: 201 });
  } catch (error) {
    console.error('Error creating absensi:', error);
    return NextResponse.json({ error: 'Failed to create absensi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, kehadiran, waktuMasuk, waktuKeluar, catatan } = body;

    if (!id) return NextResponse.json({ error: 'Absensi ID is required' }, { status: 400 });

    const absensi = await db.absensiBimbingan.update({
      where: { id },
      data: { kehadiran, waktuMasuk, waktuKeluar, catatan },
      include: { jadwal: true },
    });

    return NextResponse.json(absensi);
  } catch (error) {
    console.error('Error updating absensi:', error);
    return NextResponse.json({ error: 'Failed to update absensi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Absensi ID is required' }, { status: 400 });

    await db.absensiBimbingan.delete({ where: { id } });
    return NextResponse.json({ message: 'Absensi deleted successfully' });
  } catch (error) {
    console.error('Error deleting absensi:', error);
    return NextResponse.json({ error: 'Failed to delete absensi' }, { status: 500 });
  }
}
