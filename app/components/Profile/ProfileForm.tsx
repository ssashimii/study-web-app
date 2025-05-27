'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './ProfileForm.module.css'
import { useRouter } from 'next/navigation'


export interface ProfileFormProps {
  studentName: string
}

export default function ProfileForm({ studentName }: ProfileFormProps) {
  const router = useRouter()
  const [year, setYear] = useState('')
  const [courses, setCourses] = useState<string[]>(['', '', ''])
  const [interests, setInterests] = useState('')
  const [environment, setEnvironment] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const getFirstAndLastName = (name: string): [string, string] => {
    const parts = name.trim().split(' ')
    const first = parts[0] || ''
    const last = parts.slice(1).join(' ') || ''
    return [first, last]
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('registerData')
    if (stored) {
      const parsed = JSON.parse(stored)
      setFullName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim())
      setEmail(parsed.email || '')
      setPassword(parsed.password || '')
    }
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

  const handleCourseChange = (index: number, value: string) => {
    setCourses(prev => {
      const newCourses = [...prev]
      newCourses[index] = value
      return newCourses
    })
  }

  const addCourse = () => {
    if (courses.length < 7) {
      setCourses(prev => [...prev, ''])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const [firstName, lastName] = getFirstAndLastName(fullName)

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
        courses,
      }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      console.error('Error while creating a profile')
    }
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Study Buddy</h1>
      <h2 className={styles.subtitle}>Complete your profile</h2>

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
              placeholder="Academic year"
              value={year}
              onChange={e => setYear(e.target.value)}
              className={styles.input}
              required
            />

            {courses.map((c, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Course ${i + 1}`}
                value={c}
                onChange={e => handleCourseChange(i, e.target.value)}
                className={styles.input}
                required={i < 3}
              />
            ))}

            {courses.length < 7 && (
              <button
                type="button"
                onClick={addCourse}
                className={styles.addButton}
              >
                + Add another course
              </button>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <textarea
              placeholder="Your Interests"
              value={interests}
              onChange={e => setInterests(e.target.value)}
              className={styles.textarea}
              required
            />
            <textarea
              placeholder="Study environment preference"
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              className={styles.textarea}
              required
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
