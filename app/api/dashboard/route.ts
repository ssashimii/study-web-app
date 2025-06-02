import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { parse as parseCookie } from 'cookie'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = parseCookie(cookieHeader)
    const token = cookies.token

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: true,
        availability: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const profile = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatarUrl: user.avatar ?? null,
      academic: user.academic,
      interests: user.interests,
      studyEnv: user.studyEnv,
      courses: user.courses.map(c => ({
        id: c.id,
        title: c.name,
        description: c.description,
        color: c.color || '#ddd',
      })),
    }

    const friendsRelations = await prisma.friend.findMany({
      where: { userId },
      include: {
        friend: {
          include: {
            courses: true,
          }
        }
      }
    })

    const friendsFormatted = friendsRelations.map(fr => {
      const f = fr.friend
      return {
        id: f.id,
        name: `${f.firstName} ${f.lastName}`,
        courseIds: f.courses.map(c => c.id),
        avatarUrl: f.avatar ?? null,
      }
    })

    return NextResponse.json({
      profile,
      courses: profile.courses,
      friends: friendsFormatted,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}