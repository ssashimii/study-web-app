'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  avatarUrl?: string
}
export interface Profile {
  name: string
  year: string
  avatarUrl: string | null
}

interface Message {
  id: number
  senderId: number
  receiverId: number
  text: string
  createdAt: string
}

interface DashboardProps {
  profile: Profile
  courses: Course[]
  buddies: Buddy[]
}

export default function Dashboard({ profile, courses, buddies: initialBuddies }: DashboardProps) {
  const [filter, setFilter] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [buddies, setBuddies] = useState<Buddy[]>(initialBuddies)
  const [loading, setLoading] = useState(false)
  const [openChats, setOpenChats] = useState<{buddy: Buddy, messages: Message[]}[]>([])
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({})
  const chatBodyRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const router = useRouter()

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/buddies')
        if (!res.ok) throw new Error('Failed to fetch buddies')
        const data = await res.json()
        setBuddies(data)
      } catch (error) {
        console.error('Error fetching buddies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuddies()
  }, [])

  const setChatBodyRef = useCallback((id: number) => (el: HTMLDivElement | null) => {
    if (el) {
      chatBodyRefs.current[id] = el
    }
  }, [])

  const toggleProfileDropdown = () => setProfileDropdownOpen(p => !p)
  const handleViewProfile = () => router.push('/profile')
  const handleStudyAvailability = () => router.push('/availability')
  const handleMessages = () => router.push('/messages')
  const handleBuddies = () => router.push('/buddies')
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/register')
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

  const openChat = async (buddy: Buddy) => {
    if (openChats.some(chat => chat.buddy.id === buddy.id)) return
    
    try {
      const res = await fetch(`/api/messages?contactId=${buddy.id}`)
      if (!res.ok) throw new Error('Failed to load messages')
      const messages = await res.json()
      
      setOpenChats(prev => [...prev, { buddy, messages }])
      setChatInputs(prev => ({ ...prev, [buddy.id]: '' }))
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const closeChat = (id: number) => {
    setOpenChats(prev => prev.filter(chat => chat.buddy.id !== id))
    setChatInputs(prev => {
      const newInputs = { ...prev }
      delete newInputs[id]
      return newInputs
    })
  }

  const sendMessage = async (buddyId: number) => {
    const messageText = chatInputs[buddyId]?.trim()
    if (!messageText) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: buddyId, text: messageText }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const newMessage = await res.json()
      
      setOpenChats(prev => prev.map(chat => 
        chat.buddy.id === buddyId 
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ))
      
      setChatInputs(prev => ({ ...prev, [buddyId]: '' }))
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleChatInputChange = (buddyId: number, value: string) => {
    setChatInputs(prev => ({ ...prev, [buddyId]: value }))
  }

  useEffect(() => {
    openChats.forEach(chat => {
      const ref = chatBodyRefs.current[chat.buddy.id]
      if (ref) {
        ref.scrollTop = ref.scrollHeight
      }
    })
  }, [openChats])

  const buddiesInCommon = selectedCourse
    ? buddies.filter(b => b.courseIds.includes(selectedCourse.id))
    : []

  return (
    <div className={styles.wrapper}>
      {/* ─── MOBILE HEADER ────────────────────────── */}
      <div className={styles.mobileHeader}>
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
                My Study Availability
              </button>
            </div>
          )}
        </div>
        <button className={styles.navItem}>Courses</button>
        <button className={styles.navItem} onClick={handleBuddies}>
          Buddies
        </button>
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
              placeholder="Search buddies…"
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
          <h2 className={styles.welcomeMessage}>Hello, {profile.name.split(' ')[0]} 👋 Here is your dashboard!</h2>
        <h3 className={styles.sectionTitle}>Current Courses</h3>
        <div className={styles.coursesContainer}>
          {filteredCourses.map(c => (
            <div
              key={c.id}
              className={styles.courseCard}
              style={{ backgroundColor: c.color || '#f5f5f5' }}
              onClick={() => setSelectedCourse(c)}
            >
              <div className={styles.courseCardContent}>
                <h4 className={styles.courseTitle}>{c.title}</h4>
                <p className={styles.courseDescription}>{c.description}</p>
              </div>
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
                      <div className={styles.buddyAvatar}>
                        {b.avatarUrl ? (
                          <img src={b.avatarUrl} alt={b.name} />
                        ) : (
                          <span>{b.name.charAt(0)}</span>
                        )}
                      </div>
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
          {openChats.map(({ buddy, messages }) => (
            <div key={buddy.id} className={styles.chatWindow}>
              <div className={styles.chatHeader}>
                <div className={styles.chatBuddyInfo}>
                  {buddy.avatarUrl ? (
                    <img src={buddy.avatarUrl} alt={buddy.name} className={styles.chatBuddyAvatar} />
                  ) : (
                    <div className={styles.chatBuddyAvatar}>{buddy.name.charAt(0)}</div>
                  )}
                  <span className={styles.chatBuddyName}>{buddy.name}</span>
                </div>
                <button onClick={() => closeChat(buddy.id)} className={styles.chatClose}>
                  <FiX size={20} />
                </button>
              </div>
              <div 
                className={styles.chatBody}
                ref={setChatBodyRef(buddy.id)}
              >
                {messages.map(msg => {
                  const isMyMessage = msg.senderId !== buddy.id
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageBubble} ${
                        isMyMessage ? styles.sent : styles.received
                      }`}
                    >
                      <div className={styles.messageText}>{msg.text}</div>
                      <div className={styles.timestamp}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  value={chatInputs[buddy.id] || ''}
                  onChange={e => handleChatInputChange(buddy.id, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(buddy.id)}
                  placeholder="Type a message..."
                  className={styles.chatInputField}
                />
                <button 
                  onClick={() => sendMessage(buddy.id)} 
                  className={styles.chatSendButton}
                  disabled={!chatInputs[buddy.id]?.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ─── RIGHT PANEL (DESKTOP ONLY) ───────────── */}
      <aside className={styles.buddies}>
        <h3 className={styles.sectionTitle}>My Buddies</h3>
        {loading ? (
          <p>Loading buddies...</p>
        ) : buddies.length === 0 ? (
          <p>No buddies added yet.</p>
        ) : (
          buddies.map(b => (
            <div key={b.id} className={styles.buddy}>
              <div className={styles.buddyAvatar}>
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt={b.name} />
                ) : (
                  <span>{b.name.charAt(0)}</span>
                )}
              </div>
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
          ))
        )}
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