'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './profile.module.css'


type Availability = {
  day: string
  from: string
  to: string
  topic?: string | null
}

type Course = {
  name: string
  description?: string | null
  color?: string | null
}

type ProfileData = {
  firstName: string
  lastName: string
  avatar?: string | null
  academic: string
  interests: string
  studyEnv: string
  availability: Availability[]
  courses: Course[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data: ProfileData = await res.json()
        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <div>Loading profile...</div>
  if (!profile) return <div>Profile not found</div>

return (
  <div className={styles['profile-container']}>
    <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
        ← Back
      </button>
    <div className={styles['profile-header']}>
      {profile.avatar
        ? <img src={profile.avatar} alt="Avatar" className={styles['profile-avatar']} />
        : <div className={styles['profile-avatar']}>👤</div>
      }
      <h1 className={styles['profile-name']}>{profile.firstName} {profile.lastName}</h1>
      <p className={styles['profile-academic']}><strong>Academic Year:</strong> {profile.academic}</p>
    </div>

    <section className={styles.section}>
      <h2>Courses</h2>
      <ul className={styles.list}>
        {profile.courses.length > 0 ? profile.courses.map((c, i) => (
          <li key={i}>
            <strong>{c.name}</strong>{c.description ? ` — ${c.description}` : ''}
          </li>
        )) : <li>No courses listed</li>}
      </ul>
    </section>

    <section className={styles.section}>
      <h2>Availability</h2>
      <ul className={styles.list}>
        {profile.availability.length > 0 ? profile.availability.map((a, i) => (
          <li key={i}>
            <strong>{a.day}</strong>: {a.from} - {a.to} {a.topic ? `(Topic: ${a.topic})` : ''}
          </li>
        )) : <li>No availability specified</li>}
      </ul>
    </section>

    <section className={styles.section}>
      <h2>Interests and Study Environment</h2>
      <p><strong>Interests:</strong> {profile.interests}</p>
      <p><strong>Study Environment:</strong> {profile.studyEnv}</p>
    </section>
  </div>
)


}
