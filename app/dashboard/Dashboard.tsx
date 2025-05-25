'use client'

import React, { useState } from 'react'
import {
  FiHome,
  FiMenu,
  FiMessageSquare,
  FiX,
  FiSearch,
} from 'react-icons/fi'
import styles from './Dashboard.module.css'
import { useRouter } from 'next/navigation'

export interface Course {
  id: number
  title: string
  description: string
  color?: string
}
export interface Buddy {
  id: number
  name: string
  courseIds: number[]
}
export interface Profile {
  name: string
  year: string
  avatarUrl: string | null
}

interface DashboardProps {
  profile: Profile
  courses: Course[]
  buddies: Buddy[]
}

export default function Dashboard({ profile, courses, buddies }: DashboardProps) {
  const [filter, setFilter] = useState('')
  const [openChats, setOpenChats] = useState<Buddy[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const toggleProfileDropdown = () => setProfileDropdownOpen(p => !p)
  const handleViewProfile = () => router.push('/profile')
  const handleStudyAvailability = () => router.push('/availability')
  const handleMessages = () => router.push('/messages')
  const handleLogout = async () => {
  try {
    const res = await fetch('/api/logout', { method: 'POST' })
    if (res.ok) {
      router.push('/register') // после выхода отправляем на регистрацию
    } else {
      console.error('Logout failed')
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}
  const closeModal = () => setSelectedCourse(null)

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(filter.toLowerCase())
  )

  const openChat = (b: Buddy) => {
    setOpenChats(prev => (prev.some(x => x.id === b.id) ? prev : [...prev, b]))
  }
  const closeChat = (id: number) => {
    setOpenChats(prev => prev.filter(b => b.id !== id))
  }

  const buddiesInCommon = selectedCourse
    ? buddies.filter(b => b.courseIds.includes(selectedCourse.id))
    : []

  return (
    <div className={styles.wrapper}>
      {/* ─── MOBILE HEADER ────────────────────────── */}
      <div className={styles.mobileHeader}>
        <h1 className={styles.logo}>Study Buddy</h1>
        <button
          className={styles.searchIcon}
          onClick={() => {}}
        >
          <FiSearch />
        </button>
      </div>

      {/* ─── DESKTOP SIDEBAR ───────────────────────── */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <div className={styles.dropdownWrapper}>
          <button className={styles.navItem} onClick={toggleProfileDropdown}>
            Profile ▾
          </button>
          {profileDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button
                className={styles.dropdownItem}
                onClick={handleViewProfile}
              >
                View Profile
              </button>
              <button
                className={styles.dropdownItem}
                onClick={handleStudyAvailability}
              >
                Your Study Availability
              </button>
            </div>
          )}
        </div>
        <button className={styles.navItem}>Courses</button>
        <button className={styles.navItem}>Buddies</button>
        <button className={styles.navItem} onClick={handleMessages}>
          Messages
        </button>
        <button className={styles.navItem}>Settings</button>
        <button className={styles.navItem} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* ─── DESKTOP HEADER ────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.courseSearch}>
            <input
              type="text"
              placeholder="Search courses…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        <h1 className={styles.logo}>Study Buddy</h1>
      </header>

      {/* ─── MAIN AREA ─────────────────────────────── */}
      <main className={styles.main}>
        <h3 className={styles.sectionTitle}>Current Courses</h3>
        <div className={styles.coursesGrid}>
          {filteredCourses.map(c => (
            <div
              key={c.id}
              className={
                c.id === filteredCourses[filteredCourses.length - 1].id
                  ? styles.courseItemLarge
                  : styles.courseItem
              }
              style={{ backgroundColor: c.color || '#ddd' }}
              onClick={() => setSelectedCourse(c)}
            >
              {c.title}
            </div>
          ))}
        </div>

        {selectedCourse && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{selectedCourse.title}</h2>
                <button
                  onClick={closeModal}
                  className={styles.modalClose}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalDescription}>
                  {selectedCourse.description}
                </p>
              </div>
              <div className={styles.modalFooter}>
                <h3>Buddies taking this course:</h3>
                <ul className={styles.modalBuddyList}>
                  {buddiesInCommon.map(b => (
                    <li key={b.id} className={styles.modalBuddyItem}>
                      <div className={styles.buddyAvatar} />
                      <span className={styles.buddyName}>{b.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── CHAT WINDOWS ─────────────────────────── */}
        <div className={styles.chatContainer}>
          {openChats.map(b => (
            <ChatWindow key={b.id} buddy={b} onClose={() => closeChat(b.id)} />
          ))}
        </div>
      </main>

      {/* ─── RIGHT PANEL (DESKTOP ONLY) ───────────── */}
      <aside className={styles.buddies}>
        <h3 className={styles.sectionTitle}>Buddies Online</h3>
        {buddies.map(b => (
          <div key={b.id} className={styles.buddy}>
            <div className={styles.buddyAvatar} />
            <div className={styles.buddyInfo}>
              <span className={styles.buddyName}>{b.name}</span>
              <button
                className={styles.buddyBtn}
                onClick={() => openChat(b)}
              >
                <FiMessageSquare /> Text
              </button>
            </div>
          </div>
        ))}
      </aside>

      {/* ─── BOTTOM MOBILE NAV ─────────────────────── */}
      <div className={styles.mobileNav}>
        <button onClick={() => router.push('/')}>
          <FiHome />
        </button>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setMobileMenuOpen(m => !m)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* ─── MOBILE DROPDOWN ──────────────────────── */}
      {mobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          <h2 className={styles.sidebarTitle}>My Dashboard</h2>
          <button
            className={styles.navItem}
            onClick={toggleProfileDropdown}
          >
            Profile ▾
          </button>
          {profileDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button
                className={styles.dropdownItem}
                onClick={handleViewProfile}
              >
                View Profile
              </button>
              <button
                className={styles.dropdownItem}
                onClick={handleStudyAvailability}
              >
                Your Study Availability
              </button>
            </div>
          )}
          <button className={styles.navItem}>Courses</button>
          <button className={styles.navItem}>Buddies</button>
          <button
            className={styles.navItem}
            onClick={handleMessages}
          >
            Messages
          </button>
          <button className={styles.navItem}>Settings</button>
          <button
            className={styles.navItem}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function ChatWindow({
  buddy,
  onClose,
}: {
  buddy: Buddy
  onClose(): void
}) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, `You: ${input}`])
    setInput('')
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <span>Chat with {buddy.name}</span>
        <button onClick={onClose} className={styles.chatClose}>
          ×
        </button>
      </div>
      <div className={styles.chatBody}>
        {messages.map((m, i) => (
          <div key={i} className={styles.chatMessage}>
            {m}
          </div>
        ))}
      </div>
      <div className={styles.chatInput}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          className={styles.chatInputField}
          rows={2}
        />
        <button onClick={send} className={styles.chatSend}>
          Send
        </button>
      </div>
    </div>
  )
}
