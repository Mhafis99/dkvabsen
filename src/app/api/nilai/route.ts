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
      const nilai = await db.nilaiBimbingan.findUnique({
        where: { id },
        include: { jadwal: { include: { guru: true, siswa: { include: { kelas: true } } } } },
      });
      if (!nilai) return NextResponse.json({ error: 'Nilai not found' }, { status: 404 });
      return NextResponse.json(nilai);
    }

    const where: any = {};
    if (siswaId) where.siswaId = siswaId;
    if (jadwalId) where.jadwalId = jadwalId;

    const nilaiList = await db.nilaiBimbingan.findMany({
      where,
      include: { jadwal: { include: { guru: true, siswa: { include: { kelas: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(nilaiList);
  } catch (error) {
    console.error('Error fetching nilai:', error);
    return NextResponse.json({ error: 'Failed to fetch nilai' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { jadwalId, guruId, siswaId, nilaiPraktik, nilaiTeori, keterangan } = body;

    if (!jadwalId || !guruId || !siswaId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jadwal = await db.jadwalBimbingan.findUnique({ where: { id: jadwalId } });
    if (!jadwal) return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });

    const nilaiAkhir = (nilaiPraktik && nilaiTeori) ? (parseFloat(nilaiPraktik) + parseFloat(nilaiTeori)) / 2 : null;

    const nilai = await db.nilaiBimbingan.create({
      data: {
        jadwalId,
        guruId,
        siswaId,
        nilaiPraktik: nilaiPraktik ? parseFloat(nilaiPraktik) : null,
        nilaiTeori: nilaiTeori ? parseFloat(nilaiTeori) : null,
        nilaiAkhir,
        keterangan,
      },
      include: { jadwal: true },
    });

    return NextResponse.json(nilai, { status: 201 });
  } catch (error) {
    console.error('Error creating nilai:', error);
    return NextResponse.json({ error: 'Failed to create nilai' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GURU')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, nilaiPraktik, nilaiTeori, keterangan } = body;

    if (!id) return NextResponse.json({ error: 'Nilai ID is required' }, { status: 400 });

    const nilaiAkhir = (nilaiPraktik && nilaiTeori) ? (parseFloat(nilaiPraktik) + parseFloat(nilaiTeori)) / 2 : null;

    const nilai = await db.nilaiBimbingan.update({
      where: { id },
      data: {
        ...(nilaiPraktik !== undefined && { nilaiPraktik: parseFloat(nilaiPraktik) }),
        ...(nilaiTeori !== undefined && { nilaiTeori: parseFloat(nilaiTeori) }),
        ...(nilaiAkhir !== null && { nilaiAkhir }),
        ...(keterangan !== undefined && { keterangan }),
      },
      include: { jadwal: true },
    });

    return NextResponse.json(nilai);
  } catch (error) {
    console.error('Error updating nilai:', error);
    return NextResponse.json({ error: 'Failed to update nilai' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Nilai ID is required' }, { status: 400 });

    await db.nilaiBimbingan.delete({ where: { id } });
    return NextResponse.json({ message: 'Nilai deleted successfully' });
  } catch (error) {
    console.error('Error deleting nilai:', error);
    return NextResponse.json({ error: 'Failed to delete nilai' }, { status: 500 });
  }
}
