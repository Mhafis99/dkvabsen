import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@sekolah.com' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await hashPassword('password123');

    const admin = await db.user.create({
      data: {
        email: 'admin@sekolah.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });

    // Create teacher user
    const hashedPasswordGuru = await hashPassword('password123');
    const guru = await db.user.create({
      data: {
        email: 'guru@sekolah.com',
        password: hashedPasswordGuru,
        name: 'Guru Pembimbing',
        role: 'GURU',
      },
    });

    // Create Guru record
    await db.guru.create({
      data: {
        userId: guru.id,
        nip: 'GURU001',
        nama: 'Budi Santoso',
        jenisKelamin: 'LAKI_LAKI',
        statusGuru: 'PEMBIMBING',
        noTelepon: '08123456789',
      },
    });

    // Create student user
    const hashedPasswordSiswa = await hashPassword('password123');
    const siswa = await db.user.create({
      data: {
        email: 'siswa@sekolah.com',
        password: hashedPasswordSiswa,
        name: 'Siswa Demo',
        role: 'SISWA',
      },
    });

    // Create a class first
    const kelas = await db.kelas.create({
      data: {
        namaKelas: 'XII RPL 1',
        tingkat: 'XII',
        jurusan: 'RPL',
      },
    });

    // Create Siswa record
    await db.siswa.create({
      data: {
        userId: siswa.id,
        nis: '12345',
        nama: 'Ahmad Rizky',
        jenisKelamin: 'LAKI_LAKI',
        kelasId: kelas.id,
        noTelepon: '08987654321',
      },
    });

    return NextResponse.json({
      message: 'Demo users created successfully',
      users: {
        admin: 'admin@sekolah.com',
        guru: 'guru@sekolah.com',
        siswa: 'siswa@sekolah.com',
      },
    });
  } catch (error) {
    console.error('Error creating demo users:', error);
    return NextResponse.json(
      { error: 'Failed to create demo users' },
      { status: 500 }
    );
  }
}
