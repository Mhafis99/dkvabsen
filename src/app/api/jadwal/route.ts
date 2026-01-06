import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET - Fetch all jadwal or single jadwal by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const guruId = searchParams.get('guruId');
    const siswaId = searchParams.get('siswaId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (id) {
      // Fetch single jadwal
      const jadwal = await db.jadwalBimbingan.findUnique({
        where: { id },
        include: { guru: true, siswa: true, absensi: true, nilai: true },
      });

      if (!jadwal) {
        return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });
      }

      return NextResponse.json(jadwal);
    }

    // Build where clause
    const where: any = {};
    if (guruId) where.guruId = guruId;
    if (siswaId) where.siswaId = siswaId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) where.tanggal.gte = new Date(startDate);
      if (endDate) where.tanggal.lte = new Date(endDate);
    }

    // Fetch all jadwal
    const jadwalList = await db.jadwalBimbingan.findMany({
      where,
      include: {
        guru: true,
        siswa: { include: { kelas: true } },
        absensi: true,
        nilai: true,
      },
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json(jadwalList);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jadwal' },
      { status: 500 }
    );
  }
}

// POST - Create new jadwal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      guruId,
      siswaId,
      mataBimbingan,
      tanggal,
      jamMulai,
      jamSelesai,
      ruang,
      topik,
    } = body;

    if (!guruId || !siswaId || !mataBimbingan || !tanggal || !jamMulai || !jamSelesai) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if guru exists
    const guru = await db.guru.findUnique({
      where: { id: guruId },
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
    }

    // Check if siswa exists
    const siswa = await db.siswa.findUnique({
      where: { id: siswaId },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    const jadwal = await db.jadwalBimbingan.create({
      data: {
        guruId,
        siswaId,
        mataBimbingan,
        tanggal: new Date(tanggal),
        jamMulai,
        jamSelesai,
        ruang,
        topik,
        status: 'SCHEDULED',
      },
      include: {
        guru: true,
        siswa: { include: { kelas: true } },
      },
    });

    return NextResponse.json(jadwal, { status: 201 });
  } catch (error) {
    console.error('Error creating jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to create jadwal' },
      { status: 500 }
    );
  }
}

// PUT - Update jadwal
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      guruId,
      siswaId,
      mataBimbingan,
      tanggal,
      jamMulai,
      jamSelesai,
      ruang,
      topik,
      status,
      catatan,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Jadwal ID is required' },
        { status: 400 }
      );
    }

    // Check if siswa exists if siswaId is provided
    if (siswaId) {
      const siswa = await db.siswa.findUnique({
        where: { id: siswaId },
      });

      if (!siswa) {
        return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
      }
    }

    const jadwal = await db.jadwalBimbingan.update({
      where: { id },
      data: {
        ...(guruId && { guruId }),
        ...(siswaId && { siswaId }),
        ...(mataBimbingan && { mataBimbingan }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(jamMulai && { jamMulai }),
        ...(jamSelesai && { jamSelesai }),
        ...(ruang !== undefined && { ruang }),
        ...(topik !== undefined && { topik }),
        ...(status && { status }),
        ...(catatan !== undefined && { catatan }),
      },
      include: {
        guru: true,
        siswa: { include: { kelas: true } },
      },
    });

    return NextResponse.json(jadwal);
  } catch (error) {
    console.error('Error updating jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to update jadwal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete jadwal
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Jadwal ID is required' },
        { status: 400 }
      );
    }

    await db.jadwalBimbingan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jadwal deleted successfully' });
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to delete jadwal' },
      { status: 500 }
    );
  }
}
