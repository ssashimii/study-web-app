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
          create: courses.filter(Boolean).map((name: string) => ({ name })),
        },
      },
    })

    // Создаем токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Устанавливаем токен в куки
    const cookieStore = cookies()
    ;(await cookieStore).set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, 
    })

    return NextResponse.json({ success: true, message: 'User registered and logged in' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
