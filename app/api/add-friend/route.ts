import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

function getUserIdFromToken(req: NextRequest): number | null {
  const token = req.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req)
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { friendId } = await req.json()

  const friendUser = await prisma.user.findUnique({
    where: { id: friendId },
  })

  if (!friendUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (currentUserId === friendId) {
    return NextResponse.json(
      { error: 'Cannot add yourself as a friend' },
      { status: 400 }
    )
  }

  const existingFriend = await prisma.friend.findFirst({
    where: {
      userId: currentUserId,
      friendId: friendId,
    },
  })

  if (existingFriend) {
    return NextResponse.json(
      { error: 'This user is already your friend' },
      { status: 400 }
    )
  }

  try {
    await prisma.$transaction([
      prisma.friend.create({
        data: {
          userId: currentUserId,
          friendId: friendId,
        },
      }),
      prisma.friend.create({
        data: {
          userId: friendId,
          friendId: currentUserId,
        },
      }),
    ])

    const friendWithDetails = await prisma.user.findUnique({
      where: { id: friendId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        courses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!friendWithDetails) {
      throw new Error('Friend not found after creation')
    }

    return NextResponse.json({
      success: true,
      message: 'Friend added successfully',
      friend: {
        id: friendWithDetails.id,
        name: `${friendWithDetails.firstName} ${friendWithDetails.lastName}`,
        avatarUrl: friendWithDetails.avatar || undefined,
        courseIds: friendWithDetails.courses.map(c => c.id),
      },
    })
  } catch (error) {
    console.error('Error adding friend:', error)
    return NextResponse.json(
      { error: 'Failed to add friend' },
      { status: 500 }
    )
  }
}