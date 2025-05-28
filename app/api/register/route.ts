import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export async function POST(req: Request) {
  const data = await req.json()
  const {
    firstName,
    lastName,
    email,
    password,
    avatar,
    academic,
    interests,
    studyEnv,
    courses,
  } = data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingCourses = await prisma.course.findMany({
      where: {
        id: { in: courses.filter(Boolean) },
      },
    })

    if (existingCourses.length !== courses.filter(Boolean).length) {
      return NextResponse.json(
        { error: 'One or more courses not found' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
        academic,
        interests,
        studyEnv,
        courses: {
          connect: courses.filter(Boolean).map((id: number) => ({ id })),
        },
      },
      include: {
        courses: true, 
      },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const cookieStore = await cookies()
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })


    return NextResponse.json({ 
      success: true, 
      message: 'User registered and logged in',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        courses: user.courses,
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to register user' }, 
      { status: 500 }
    )
  }
}