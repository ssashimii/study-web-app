import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import Dashboard, { Course, Buddy, Profile } from './Dashboard'
import { getProfile, getBuddies } from '@/lib/data'  

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    throw new Error('Unauthorized: No token')
  }

  let userId: number
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    userId = decoded.userId
  } catch {
    throw new Error('Invalid token')
  }

  const profile: Profile | null = await getProfile(userId)
  if (!profile) {
    throw new Error('Profile not found')
  }

  if (!profile.courses) {
  throw new Error('Profile courses not found');
  }
  const courses: Course[] = profile.courses;

  const buddies: Buddy[] = await getBuddies(userId)

  return (
    <Dashboard
      profile={profile}
      courses={courses}
      buddies={buddies}
    />
  )
}
