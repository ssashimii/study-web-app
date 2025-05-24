// app/dashboard/page.tsx
import Dashboard, { Course, Buddy, Profile } from './Dashboard'
import { getProfile, getCourses, getBuddies } from '@/lib/data'

export default async function Page() {
  // grab your fake “you”
  const profile: Profile  = await getProfile()

  // grab the fake courses list
  const courses: Course[] = await getCourses()

  // grab the fake buddies list
  const buddies: Buddy[]  = await getBuddies()

  return (
    <Dashboard
      profile={profile}
      courses={courses}
      buddies={buddies}
    />
  )
}
