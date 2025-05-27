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

export async function POST(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req);
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { friendId } = await req.json();

  const friendUser = await prisma.user.findUnique({
    where: { id: friendId },
  });

  if (!friendUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const newFriend = await prisma.friend.create({
      data: {
        userId: currentUserId,
        friendId: friendId,
      },
    });

    return NextResponse.json({ message: 'Friend added', friend: newFriend });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add friend' }, { status: 500 });
  }
}

