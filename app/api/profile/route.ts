import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number, email: string }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        academic: true,
        interests: true,
        studyEnv: true,
        courses: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number, email: string }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const data = await request.json()

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        academic: data.academic,
        interests: data.interests,
        studyEnv: data.studyEnv,
      }
    })

    if (data.courses) {

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          courses: {
            select: { id: true }
          }
        }
      })

      const currentCourseIds = currentUser?.courses.map(c => c.id) || []
      const newCourseIds = data.courses.map((c: {id: number}) => c.id)

      const coursesToAdd = newCourseIds.filter((id: number) => !currentCourseIds.includes(id))
      
      const coursesToRemove = currentCourseIds.filter(id => !newCourseIds.includes(id))

      await prisma.user.update({
        where: { id: userId },
        data: {
          courses: {
            connect: coursesToAdd.map((id: number) => ({ id })),
            disconnect: coursesToRemove.map((id: number) => ({ id }))
          }
        }
      })
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        academic: true,
        interests: true,
        studyEnv: true,
        courses: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}