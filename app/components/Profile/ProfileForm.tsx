'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './ProfileForm.module.css'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  name: string
  description?: string
  color?: string
}

export interface ProfileFormProps {
  studentName: string
}

export default function ProfileForm({ studentName }: ProfileFormProps) {
  const router = useRouter()
  const [year, setYear] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [interests, setInterests] = useState('')
  const [environment, setEnvironment] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getFirstAndLastName = (name: string): [string, string] => {
    const parts = name.trim().split(' ')
    const first = parts[0] || ''
    const last = parts.slice(1).join(' ') || ''
    return [first, last]
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (!res.ok) throw new Error('Failed to fetch courses')
        const data = await res.json()
        setAvailableCourses(data)
      } catch (error) {
        console.error('Error loading courses:', error)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoadingCourses(false)
      }
    }

    const stored = sessionStorage.getItem('registerData')
    if (stored) {
      const parsed = JSON.parse(stored)
      setFullName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim())
      setEmail(parsed.email || '')
      setPassword(parsed.password || '')
    }

    fetchCourses()
  }, [])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = parseInt(e.target.value)
    if (courseId) {
      const course = availableCourses.find(c => c.id === courseId)
      if (course && !selectedCourses.some(c => c.id === course.id)) {
        setSelectedCourses(prev => [...prev, course])
        e.target.value = ''
      }
    }
  }

  const removeCourse = (courseId: number) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedCourses.length === 0) {
      setError('Please select at least one course')
      return
    }

    const [firstName, lastName] = getFirstAndLastName(fullName)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          avatar: avatarUrl,
          academic: year,
          interests,
          studyEnv: environment,
          courses: selectedCourses.map(c => c.id),
        }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Error while creating a profile')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to register. Please try again.')
    }
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Study Buddy</h1>
      <h2 className={styles.subtitle}>Complete your profile</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            <button
              type="button"
              className={styles.uploadButton}
              onClick={openFileDialog}
            >
              Upload photo
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={styles.fileInput}
              style={{ display: 'none' }}
            />
          </div>
          <p className={styles.studentName}>{fullName}</p>
        </div>

        <div className={styles.fields}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Academic year (e.g., Freshman, Sophomore)"
              value={year}
              onChange={e => setYear(e.target.value)}
              className={styles.input}
              required
            />

            <div className={styles.courseSelection}>
              <label htmlFor="course-select" className={styles.courseLabel}>
                Select your courses:
              </label>
              
              {loadingCourses ? (
                <div className={styles.loading}>Loading courses...</div>
              ) : (
                <>
                  <select
                    id="course-select"
                    onChange={handleCourseSelect}
                    className={styles.courseSelect}
                    disabled={availableCourses.length === 0}
                  >
                    <option value="">Choose a course...</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  
                  {availableCourses.length === 0 && (
                    <p className={styles.noCourses}>No courses available. Please contact support.</p>
                  )}
                </>
              )}

              <div className={styles.selectedCourses}>
                {selectedCourses.map(course => (
                  <div key={course.id} className={styles.courseTag}>
                    <span>{course.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeCourse(course.id)}
                      className={styles.removeCourse}
                      aria-label={`Remove ${course.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.textareaGroup}>
            <textarea
              placeholder="Your interests (e.g., Music, Sports, Programming)"
              value={interests}
              onChange={e => setInterests(e.target.value)}
              className={styles.textarea}
              required
              rows={3}
            />
            <textarea
              placeholder="Study environment preference (e.g., Quiet space, Group study, Online)"
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              className={styles.textarea}
              required
              rows={3}
            />
          </div>
        </div>
      </div>

      <button type="submit" className={styles.button}>
        Register
      </button>
    </form>
  )
}