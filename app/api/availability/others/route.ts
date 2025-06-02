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

  // Получаем список друзей текущего пользователя
  const friends = await prisma.friend.findMany({
    where: {
      userId: currentUserId,
    },
    select: {
      friend: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          availability: {
            select: {
              id: true,
              day: true,
              from: true,
              to: true,
              topic: true
            },
            orderBy: {
              day: 'asc'
            }
          }
        }
      }
    }
  });

  // Форматируем данные для удобного отображения
  const formattedAvailabilities = friends.flatMap(friend => 
    friend.friend.availability.map(avail => ({
      ...avail,
      user: {
        firstName: friend.friend.firstName,
        lastName: friend.friend.lastName
      }
    }))
  );

  return NextResponse.json(formattedAvailabilities);
}