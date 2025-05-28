// app/api/matches/route.ts
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

export async function GET(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req)
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userWithCourses = await prisma.user.findUnique({
  where: { id: currentUserId },
  select: {
    courses: {
      select: { id: true }
    }
  }
})

const userCourseIds = userWithCourses?.courses.map(c => c.id) || []


    if (userCourseIds.length === 0) {
      return NextResponse.json([])
    }

    const friends = await prisma.friend.findMany({
      where: { userId: currentUserId },
      select: { friendId: true }
    })
    const friendIds = friends.map(f => f.friendId)

    const potentialBuddies = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, 
          { id: { notIn: friendIds } }, 
          {
            courses: {
              some: {
                id: { in: userCourseIds } 
              }
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        courses: {
          where: {
            id: { in: userCourseIds } 
          },
          select: {
            id: true,
            name: true,
            description: true,
            color: true
          }
        }
      }
    })

    // Форматируем ответ
    const formattedBuddies = potentialBuddies.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatarUrl: user.avatar || undefined,
      courses: user.courses,
      courseIds: user.courses.map(c => c.id)
    }))

    return NextResponse.json(formattedBuddies)
  } catch (error) {
    console.error('Failed to fetch matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch potential matches' },
      { status: 500 }
    )
  }
}