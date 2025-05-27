import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        courses: true,
        availability: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      academic: user.academic,
      courses: user.courses.map(c => ({ name: c.name, description: c.description })),
      availability: user.availability.map(a => ({
        day: a.day,
        from: a.from,
        to: a.to,
        topic: a.topic,
      })),
      interests: user.interests,
      studyEnv: user.studyEnv,
    });
  } catch (error) {
    console.error('API friend-profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
