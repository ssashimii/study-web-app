'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './profile.module.css'

type Course = {
  id: number
  name: string
}

type ProfileData = {
  firstName: string
  lastName: string
  avatar?: string | null
  academic: string
  interests: string
  studyEnv: string
  courses: Course[]
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<ProfileData>>({})
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Загружаем профиль и доступные курсы
        const [profileRes, coursesRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/courses')
        ])
        
        if (!profileRes.ok) throw new Error('Failed to fetch profile')
        if (!coursesRes.ok) throw new Error('Failed to fetch courses')
        
        const profileData: ProfileData = await profileRes.json()
        const coursesData: Course[] = await coursesRes.json()
        
        setProfile(profileData)
        setEditData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          academic: profileData.academic,
          interests: profileData.interests,
          studyEnv: profileData.studyEnv,
          avatar: profileData.avatar,
          courses: [...profileData.courses]
        })
        setAvailableCourses(coursesData)
        
        if (profileData.avatar) {
          setAvatarPreview(profileData.avatar)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const addCourse = () => {
    if (!selectedCourseId) return
    
    const courseToAdd = availableCourses.find(c => c.id === selectedCourseId)
    if (!courseToAdd) return
    
    // Проверяем, не добавлен ли уже этот курс
    if (editData.courses?.some(c => c.id === selectedCourseId)) return
    
    setEditData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), courseToAdd]
    }))
    setSelectedCourseId('')
  }

  const removeCourse = (id: number) => {
    setEditData(prev => ({
      ...prev,
      courses: (prev.courses || []).filter(c => c.id !== id)
    }))
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setEditData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          courses: editData.courses?.map(c => ({ id: c.id }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (loading) return <div className={styles.loading}>Loading profile...</div>
  if (!profile) return <div className={styles.error}>Profile not found</div>

  return (
    <div className={styles['profile-container']}>
      <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
        ← Back
      </button>
      
      <div className={styles['profile-header']}>
        {editing ? (
          <>
            <div className={styles['avatar-upload']}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className={styles['profile-avatar']} />
              ) : (
                <div className={styles['profile-avatar']}>👤</div>
              )}
              <button 
                type="button" 
                onClick={triggerFileInput}
                className={styles.uploadButton}
              >
                Change Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className={styles['edit-fields']}>
              <label htmlFor="firstName" className={styles.inputLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={editData.firstName || ''}
                onChange={handleInputChange}
                placeholder="First Name"
              />
              <label htmlFor="lastName" className={styles.inputLabel}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={editData.lastName || ''}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
              <label htmlFor="academic" className={styles.inputLabel}>Academic Year</label>
              <input
                type="text"
                name="academic"
                value={editData.academic || ''}
                onChange={handleInputChange}
                placeholder="Academic Year"
              />
            </div>
          </>
        ) : (
          <>
            {profile.avatar
              ? <img src={profile.avatar} alt="Avatar" className={styles['profile-avatar']} />
              : <div className={styles['profile-avatar']}>👤</div>
            }
            <h1 className={styles['profile-name']}>{profile.firstName} {profile.lastName}</h1>
          </>
        )}
      </div>

      {editing ? (
        <section className={styles.section}>
          <h2>Interests and Study Environment</h2>
          <textarea
            name="interests"
            value={editData.interests || ''}
            onChange={handleInputChange}
            placeholder="Your interests"
            rows={3}
          />
          <textarea
            name="studyEnv"
            value={editData.studyEnv || ''}
            onChange={handleInputChange}
            placeholder="Preferred study environment"
            rows={3}
          />
        </section>
      ) : (
        <section className={styles.section}>
          <h2>Interests and Study Environment</h2>
          <p><strong>Interests:</strong> {profile.interests}</p>
          <p><strong>Study Environment:</strong> {profile.studyEnv}</p>
        </section>
      )}

      {editing ? (
        <section className={styles.section}>
          <h2>Courses</h2>
          <div className={styles['course-selector']}>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className={styles.courseSelect}
            >
              <option value="">Select a course</option>
              {availableCourses
                .filter(course => !editData.courses?.some(c => c.id === course.id))
                .map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
            </select>
            <button 
              onClick={addCourse}
              className={styles.addButton}
              disabled={!selectedCourseId}
            >
              Add Course
            </button>
          </div>
          
          <div className={styles['selected-courses']}>
            {editData.courses?.map(course => (
              <div key={course.id} className={styles['course-item']}>
                <span>{course.name}</span>
                <button 
                  onClick={() => removeCourse(course.id)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.section}>
          <h2>Courses</h2>
          <ul className={styles.list}>
            {profile.courses.length > 0 ? profile.courses.map((c, i) => (
              <li key={i}>
                <strong>{c.name}</strong>
              </li>
            )) : <li>No courses listed</li>}
          </ul>
        </section>
      )}

            <div className={styles['profile-actions']}>
        {editing ? (
          <>
            <button onClick={handleSave} className={styles.saveButton}>Save Changes</button>
            <button onClick={() => setEditing(false)} className={styles.cancelButton}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className={styles.editButton}>Edit Profile</button>
        )}
      </div>
    </div>

    
  )
}