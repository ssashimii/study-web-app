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

  const { day, from, to, topic } = await req.json()

  try {
    const availability = await prisma.availability.create({
      data: {
        day,
        from,
        to,
        topic,
        userId: currentUserId, 
      },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req)
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const availabilityList = await prisma.availability.findMany({
      where: { userId: currentUserId },
      orderBy: { id: 'desc' },
    })

    return NextResponse.json(availabilityList)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
