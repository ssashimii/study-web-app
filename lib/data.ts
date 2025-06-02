import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default prisma

export interface Course {
  id: number
  title: string
  description: string
  color: string
}

export interface Buddy {
  id: number
  name: string
  courseIds: number[]
  avatarUrl?: string | null
}

export interface Availability {
  date: string
  time: string
  topic: string | null
}

export interface Profile {
  name: string
  year: string
  avatarUrl: string | null
  courses: Course[]  
  studyPreference?: string
  availability: Availability[]
}

export async function getCourses(): Promise<Course[]> {
  const courses = await prisma.course.findMany()
  return courses.map(c => ({
    id: c.id,
    title: c.name,
    description: (c as any).description || '',
    color: (c as any).color || '#ddd',
  }))
}

export async function getBuddies(currentUserId: number): Promise<Buddy[]> {
  const buddies = await prisma.user.findMany({
    where: {
      NOT: { id: currentUserId },
    },
    include: {
      courses: true,
    },
  })
  return buddies.map(b => ({
    id: b.id,
    name: `${b.firstName} ${b.lastName}`,
    courseIds: b.courses.map(c => c.id),
    avatarUrl: b.avatar || null,
  }))
}

export async function getProfile(userId: number): Promise<Profile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courses: true,
      availability: true,
    },
  })

  if (!user) return null

  return {
    name: `${user.firstName} ${user.lastName}`,
    year: user.academic,
    avatarUrl: user.avatar,
    courses: user.courses.map(c => ({
      id: c.id,
      title: c.name,
      description: c.description ?? '',
      color: c.color ?? '#ddd',
    })),
    studyPreference: user.studyEnv,
    availability: user.availability.map(a => ({
      date: a.day,
      time: `${a.from} - ${a.to}`,
      topic: a.topic,
    })),
  }
}