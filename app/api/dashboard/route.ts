// route.ts
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
        description: (c as any).description,
        color: ((c as any).color || '#ddd'),
    })),

    }

    const courseIds = user.courses.map(c => c.id)

    const buddies = await prisma.user.findMany({
      where: {
        courses: {
          some: {
            id: { in: courseIds },
          },
        },
        NOT: { id: userId },
      },
      include: {
        courses: true,
      },
    })

    const buddiesFormatted = buddies.map(b => ({
      id: b.id,
      name: `${b.firstName} ${b.lastName}`,
      courseIds: b.courses.map(c => c.id),
      avatarUrl: b.avatar ?? null,
    }))

    res.status(200).json({
      profile,
      courses: profile.courses,
      buddies: buddiesFormatted,
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
