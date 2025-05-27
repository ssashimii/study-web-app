import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
    const token = cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' })
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
      return res.status(404).json({ error: 'User not found' })
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

    res.status(200).json({
      profile,
      courses: profile.courses,
      friends: friendsFormatted,
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
