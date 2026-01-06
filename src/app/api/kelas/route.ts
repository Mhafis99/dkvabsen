import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET - Fetch all kelas or single kelas by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single kelas
      const kelas = await db.kelas.findUnique({
        where: { id },
        include: { siswa: true },
      });

      if (!kelas) {
        return NextResponse.json({ error: 'Kelas not found' }, { status: 404 });
      }

      return NextResponse.json(kelas);
    }

    // Fetch all kelas
    const kelasList = await db.kelas.findMany({
      include: {
        _count: {
          select: { siswa: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(kelasList);
  } catch (error) {
    console.error('Error fetching kelas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas' },
      { status: 500 }
    );
  }
}

// POST - Create new kelas
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { namaKelas, tingkat, jurusan } = body;

    if (!namaKelas || !tingkat || !jurusan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if kelas already exists
    const existingKelas = await db.kelas.findUnique({
      where: { namaKelas },
    });

    if (existingKelas) {
      return NextResponse.json(
        { error: 'Kelas already exists' },
        { status: 400 }
      );
    }

    const kelas = await db.kelas.create({
      data: {
        namaKelas,
        tingkat,
        jurusan,
      },
    });

    return NextResponse.json(kelas, { status: 201 });
  } catch (error) {
    console.error('Error creating kelas:', error);
    return NextResponse.json(
      { error: 'Failed to create kelas' },
      { status: 500 }
    );
  }
}

// PUT - Update kelas
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, namaKelas, tingkat, jurusan, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kelas ID is required' },
        { status: 400 }
      );
    }

    // Check if namaKelas already exists for another kelas
    if (namaKelas) {
      const existingKelas = await db.kelas.findFirst({
        where: {
          namaKelas,
          NOT: { id },
        },
      });

      if (existingKelas) {
        return NextResponse.json(
          { error: 'Kelas already exists' },
          { status: 400 }
        );
      }
    }

    const kelas = await db.kelas.update({
      where: { id },
      data: {
        ...(namaKelas && { namaKelas }),
        ...(tingkat && { tingkat }),
        ...(jurusan && { jurusan }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error updating kelas:', error);
    return NextResponse.json(
      { error: 'Failed to update kelas' },
      { status: 500 }
    );
  }
}

// DELETE - Delete kelas
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kelas ID is required' },
        { status: 400 }
      );
    }

    // Check if kelas has siswa
    const kelas = await db.kelas.findUnique({
      where: { id },
      include: { siswa: true },
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas not found' }, { status: 404 });
    }

    if (kelas.siswa.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete kelas with active siswa' },
        { status: 400 }
      );
    }

    await db.kelas.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Kelas deleted successfully' });
  } catch (error) {
    console.error('Error deleting kelas:', error);
    return NextResponse.json(
      { error: 'Failed to delete kelas' },
      { status: 500 }
    );
  }
}
