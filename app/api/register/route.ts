import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
    const hashedPassword = await bcrypt.hash(password, 10) // соль 10 раундов

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

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
