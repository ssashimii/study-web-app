'use client'

import React, { useEffect, useState } from 'react'
import styles from './profile.module.css'
import { getProfile, Profile } from '@/lib/data'
import Link from 'next/link'
import { FiHome, FiMenu, FiX } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [courses, setCourses] = useState<string[]>([])
  const [newCourse, setNewCourse] = useState('')
  const [studyPreference, setStudyPreference] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const profile = await getProfile()
      setUser(profile)
      setCourses(profile.courses)
      setStudyPreference(profile.studyPreference || '')
    }
    loadProfile()
  }, [])

  const handleAddCourse = () => {
    if (!newCourse.trim()) return
    setCourses([...courses, newCourse.trim()])
    setNewCourse('')
  }
  const handleDeleteCourse = (i: number) => {
    setCourses(cs => cs.filter((_, idx) => idx !== i))
  }
  const handleEditCourse = (i: number, v: string) => {
    setCourses(cs => cs.map((c, idx) => (idx === i ? v : c)))
  }

  if (!user) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.wrapper}>
      {/* Sidebar (desktop only) */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <div className={styles.navItemGroup}>

          {/* profile dropdown */}
          <div className={styles.dropdownWrapper}>
            <button
              className={styles.navItem}
              onClick={() => setProfileDropdownOpen(open => !open)}
            >
              Profile ▾
            </button>
            {profileDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link href="/profile" legacyBehavior>
                  <button className={styles.dropdownItem}>View Profile</button>
                </Link>
                <Link href="/availability" legacyBehavior>
                  <button className={styles.dropdownItem}>Your Study Availability</button>
                </Link>
              </div>
            )}
          </div>

          <Link href="/courses" className={styles.navItem}>Courses</Link>
          <Link href="/buddies" className={styles.navItem}>Buddies</Link>
          <Link href="/messages" className={styles.navItem}>Messages</Link>
          <Link href="/settings" className={styles.navItem}>Settings</Link>
          <Link href="/" className={styles.navItem}>Logout</Link>
        </div>
      </aside>

      {/* Main profile card */}
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.avatarContainer}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="Profile" className={styles.avatar}/>
              : <div className={styles.avatarFallback}>👤</div>
            }
          </div>

          <h2 className={styles.name}>{user.name}</h2>

          <div className={styles.section}>
            <h3>Courses</h3>
            <ul className={styles.courseList}>
              {courses.map((c, i) => (
                <li key={i}>
                  {editMode
                    ? (
                      <div style={{ display:'flex', gap:'.5rem' }}>
                        <input
                          className={styles.editInput}
                          value={c}
                          onChange={e => handleEditCourse(i, e.target.value)}
                        />
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteCourse(i)}
                        >✕</button>
                      </div>
                    )
                    : c
                  }
                </li>
              ))}
            </ul>
            {editMode && (
              <div className={styles.addCourseContainer}>
                <input
                  className={styles.editInput}
                  value={newCourse}
                  placeholder="New course"
                  onChange={e => setNewCourse(e.target.value)}
                />
                <button
                  className={styles.addButton}
                  onClick={handleAddCourse}
                >+ Add Course</button>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Study Preference</h3>
            {editMode
              ? <input
                  className={styles.editInput}
                  value={studyPreference}
                  onChange={e => setStudyPreference(e.target.value)}
                />
              : <p>{studyPreference || 'Not specified'}</p>
            }
          </div>

          <div className={styles.section}>
            <h3>Availability</h3>
            {user.availability.length > 0
              ? (
                <ul className={styles.availabilityList}>
                  {user.availability.map((a,i) => (
                    <li key={i}>
                      <strong>{a.date}</strong> — {a.time} <em>({a.topic})</em>
                    </li>
                  ))}
                </ul>
              )
              : (
                <Link href="/availability" legacyBehavior>
                  <button className={styles.addButton}>
                    + Add Availability
                  </button>
                </Link>
              )
            }
          </div>

          <button
            className={styles.editBtn}
            onClick={() => setEditMode(on => !on)}
          >
            {editMode ? 'Save' : 'Edit Profile'}
          </button>
        </div>
      </main>

      {/* MOBILE: bottom nav + dropdown */}
      <div className={styles.mobileNav}>
        <button onClick={() => router.push('/')}>
          <FiHome />
        </button>
        <button onClick={() => setMobileMenuOpen(o => !o)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          <Link href="/profile" legacyBehavior>
            <button className={styles.navItem}>Profile ▾</button>
          </Link>
          <Link href="/courses" className={styles.navItem}>Courses</Link>
          <Link href="/buddies" className={styles.navItem}>Buddies</Link>
          <Link href="/messages" className={styles.navItem}>Messages</Link>
          <Link href="/settings" className={styles.navItem}>Settings</Link>
          <Link href="/" className={styles.navItem}>Logout</Link>
        </div>
      )}
    </div>
  )
}
