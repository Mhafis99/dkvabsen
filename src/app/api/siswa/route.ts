import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET - Fetch all siswa or single siswa by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const kelasId = searchParams.get('kelasId');

    if (id) {
      // Fetch single siswa
      const siswa = await db.siswa.findUnique({
        where: { id },
        include: { user: true, kelas: true },
      });

      if (!siswa) {
        return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
      }

      return NextResponse.json(siswa);
    }

    // Fetch all siswa
    const where = kelasId ? { kelasId } : {};

    const siswas = await db.siswa.findMany({
      where,
      include: { user: true, kelas: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(siswas);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json(
      { error: 'Failed to fetch siswa' },
      { status: 500 }
    );
  }
}

// POST - Create new siswa
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      nis,
      nama,
      jenisKelamin,
      kelasId,
      noTelepon,
      alamat,
    } = body;

    if (!email || !password || !nis || !nama || !jenisKelamin || !kelasId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check if NIS already exists
    const existingSiswa = await db.siswa.findUnique({
      where: { nis },
    });

    if (existingSiswa) {
      return NextResponse.json(
        { error: 'NIS already exists' },
        { status: 400 }
      );
    }

    // Check if kelas exists
    const kelas = await db.kelas.findUnique({
      where: { id: kelasId },
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas not found' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: nama,
        role: 'SISWA',
      },
    });

    // Create siswa
    const siswa = await db.siswa.create({
      data: {
        userId: user.id,
        nis,
        nama,
        jenisKelamin,
        kelasId,
        noTelepon,
        alamat,
      },
      include: { user: true, kelas: true },
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    return NextResponse.json(
      { error: 'Failed to create siswa' },
      { status: 500 }
    );
  }
}

// PUT - Update siswa
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      nis,
      nama,
      jenisKelamin,
      kelasId,
      noTelepon,
      alamat,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Siswa ID is required' },
        { status: 400 }
      );
    }

    // Check if NIS already exists for another siswa
    if (nis) {
      const existingSiswa = await db.siswa.findFirst({
        where: {
          nis,
          NOT: { id },
        },
      });

      if (existingSiswa) {
        return NextResponse.json(
          { error: 'NIS already exists' },
          { status: 400 }
        );
      }
    }

    // Check if kelas exists if kelasId is provided
    if (kelasId) {
      const kelas = await db.kelas.findUnique({
        where: { id: kelasId },
      });

      if (!kelas) {
        return NextResponse.json(
          { error: 'Kelas not found' },
          { status: 404 }
        );
      }
    }

    const siswa = await db.siswa.update({
      where: { id },
      data: {
        ...(nis && { nis }),
        ...(nama && { nama }),
        ...(jenisKelamin && { jenisKelamin }),
        ...(kelasId && { kelasId }),
        ...(noTelepon !== undefined && { noTelepon }),
        ...(alamat !== undefined && { alamat }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: true, kelas: true },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error updating siswa:', error);
    return NextResponse.json(
      { error: 'Failed to update siswa' },
      { status: 500 }
    );
  }
}

// DELETE - Delete siswa
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
        { error: 'Siswa ID is required' },
        { status: 400 }
      );
    }

    // Get siswa user ID first
    const siswa = await db.siswa.findUnique({
      where: { id },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    // Delete siswa (user will be cascade deleted)
    await db.siswa.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Siswa deleted successfully' });
  } catch (error) {
    console.error('Error deleting siswa:', error);
    return NextResponse.json(
      { error: 'Failed to delete siswa' },
      { status: 500 }
    );
  }
}
