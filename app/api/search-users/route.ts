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

  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json([]);
  }

  const currentUser = await prisma.user.findUnique({
  where: { id: currentUserId },
  include: {
    friends: {
      select: {
        friendId: true,
      }
    }
  },
});
const friendIds = currentUser?.friends.map(f => f.friendId) || [];


  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
        { id: { not: currentUserId } },
        { id: { notIn: friendIds } },
      ],
    },
    take: 10,
  });

  const results = users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    avatarUrl: u.avatar || 'https://via.placeholder.com/100',
  }));

  return NextResponse.json(results);
}
