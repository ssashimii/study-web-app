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

  const { searchParams } = new URL(req.url)
  const contactId = Number(searchParams.get('contactId'))

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: contactId },
        { senderId: contactId, receiverId: currentUserId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const currentUserId = getUserIdFromToken(req)
  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { receiverId, text } = await req.json()

  const message = await prisma.message.create({
    data: {
      senderId: currentUserId,
      receiverId,
      text,
    },
  })

  return NextResponse.json(message)
}
