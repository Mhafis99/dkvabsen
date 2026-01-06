import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET - Fetch all gurus or single guru by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single guru
      const guru = await db.guru.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!guru) {
        return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
      }

      return NextResponse.json(guru);
    }

    // Fetch all gurus
    const gurus = await db.guru.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(gurus);
  } catch (error) {
    console.error('Error fetching gurus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gurus' },
      { status: 500 }
    );
  }
}

// POST - Create new guru
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
      nip,
      nama,
      jenisKelamin,
      statusGuru,
      noTelepon,
      alamat,
    } = body;

    if (!email || !password || !nip || !nama || !jenisKelamin) {
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

    // Check if NIP already exists
    const existingGuru = await db.guru.findUnique({
      where: { nip },
    });

    if (existingGuru) {
      return NextResponse.json(
        { error: 'NIP already exists' },
        { status: 400 }
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
        role: 'GURU',
      },
    });

    // Create guru
    const guru = await db.guru.create({
      data: {
        userId: user.id,
        nip,
        nama,
        jenisKelamin,
        statusGuru: statusGuru || 'GURU_BIASA',
        noTelepon,
        alamat,
      },
      include: { user: true },
    });

    return NextResponse.json(guru, { status: 201 });
  } catch (error) {
    console.error('Error creating guru:', error);
    return NextResponse.json(
      { error: 'Failed to create guru' },
      { status: 500 }
    );
  }
}

// PUT - Update guru
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, nip, nama, jenisKelamin, statusGuru, noTelepon, alamat, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Guru ID is required' },
        { status: 400 }
      );
    }

    // Check if NIP already exists for another guru
    if (nip) {
      const existingGuru = await db.guru.findFirst({
        where: {
          nip,
          NOT: { id },
        },
      });

      if (existingGuru) {
        return NextResponse.json(
          { error: 'NIP already exists' },
          { status: 400 }
        );
      }
    }

    const guru = await db.guru.update({
      where: { id },
      data: {
        ...(nip && { nip }),
        ...(nama && { nama }),
        ...(jenisKelamin && { jenisKelamin }),
        ...(statusGuru && { statusGuru }),
        ...(noTelepon !== undefined && { noTelepon }),
        ...(alamat !== undefined && { alamat }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { user: true },
    });

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error updating guru:', error);
    return NextResponse.json(
      { error: 'Failed to update guru' },
      { status: 500 }
    );
  }
}

// DELETE - Delete guru
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
        { error: 'Guru ID is required' },
        { status: 400 }
      );
    }

    // Get guru user ID first
    const guru = await db.guru.findUnique({
      where: { id },
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
    }

    // Delete guru (user will be cascade deleted)
    await db.guru.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Guru deleted successfully' });
  } catch (error) {
    console.error('Error deleting guru:', error);
    return NextResponse.json(
      { error: 'Failed to delete guru' },
      { status: 500 }
    );
  }
}
