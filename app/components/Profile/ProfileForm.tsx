'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProfileForm.module.css'

interface ProfileFormProps {
  studentName: string
}

export default function ProfileForm({ studentName }: ProfileFormProps) {
  const router = useRouter()
  const [avatar, setAvatar]         = useState<string | null>(null)
  const [year, setYear]             = useState<string>('')
  const [course1, setCourse1]       = useState<string>('')
  const [course2, setCourse2]       = useState<string>('')
  const [course3, setCourse3]       = useState<string>('')
  const [course4, setCourse4]       = useState<string>('')
  const [interests, setInterests]   = useState<string>('')
  const [environment, setEnvironment] = useState<string>('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: send profile data (including avatar) to your backend
    console.log({
      studentName,
      avatar,
      year,
      course1,
      course2,
      course3,
      course4,
      interests,
      environment,
    })

    // After completing profile, navigate to the dashboard
    router.push('/dashboard')
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Study Buddy</h1>
      <h2 className={styles.subtitle}>Complete your profile</h2>

      <div className={styles.content}>
        <div className={styles.left}>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className={styles.fileInput}
          />
          <label htmlFor="avatarUpload" className={styles.avatarUpload}>
            {avatar ? (
              <img src={avatar} alt="Avatar preview" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            <span className={styles.uploadText}>Upload photo</span>
          </label>
          <p className={styles.studentName}>{studentName}</p>
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
            {[course1, course2, course3, course4].map((c, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Course ${i + 1}`}
                value={[course1, course2, course3, course4][i]}
                onChange={e => {
                  const setters = [setCourse1, setCourse2, setCourse3, setCourse4]
                  setters[i](e.target.value)
                }}
                className={styles.input}
              />
            ))}
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
