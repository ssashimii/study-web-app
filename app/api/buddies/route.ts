import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

function getUserIdFromToken(req: NextRequest): number | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req);
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const friends = await prisma.friend.findMany({
    where: {
      userId: currentUserId,
    },
    include: {
      friend: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        //   studyPreference: true,
          courses: true,
          availability: true,
        },
      },
    },
  });

  const formatted = friends.map(f => ({
    id: f.friend.id,
    name: `${f.friend.firstName} ${f.friend.lastName}`,
    avatarUrl: f.friend.avatar || 'https://via.placeholder.com/100',
    courses: f.friend.courses || [],
    availability: f.friend.availability || [],
  }));

  return NextResponse.json(formatted);
}
