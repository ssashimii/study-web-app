'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  FiHome,
  FiMenu,
  FiMessageSquare,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiLogOut,
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
  courseIds?: number[]
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
  const [showMobileChats, setShowMobileChats] = useState(false)
  const [buddies, setBuddies] = useState<Buddy[]>(initialBuddies.map(b => ({
    ...b,
    courseIds: b.courseIds || []
  })))
  const [loading, setLoading] = useState(false)
  const [openChats, setOpenChats] = useState<{buddy: Buddy, messages: Message[]}[]>([])
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({})
  const [potentialBuddies, setPotentialBuddies] = useState<Buddy[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const chatBodyRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [activeMobileChat, setActiveMobileChat] = useState<Buddy | null>(null);
  const router = useRouter()

  useEffect(() => {
    const loadBuddies = async () => {
      setLoading(true)
      const buddiesData = await fetchBuddies()
      setBuddies(buddiesData)
      setLoading(false)
    }
    
    loadBuddies()
  }, [])

  const fetchPotentialBuddies = useCallback(async () => {
    try {
      setLoadingMatches(true)
      const res = await fetch('/api/matches', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch potential buddies')
      const data = await res.json()
      setPotentialBuddies(data)
    } catch (error) {
      console.error('Error fetching potential buddies:', error)
    } finally {
      setLoadingMatches(false)
    }
  }, [])

  useEffect(() => {
    fetchPotentialBuddies()
  }, [fetchPotentialBuddies])

  const addBuddy = async (buddyId: number) => {
    try {
      const res = await fetch('/api/add-friend', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: buddyId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add buddy')
      }

      setPotentialBuddies(prev => prev.filter(b => b.id !== buddyId))
      
      const updatedBuddies = await fetchBuddies()
      setBuddies(updatedBuddies)

      console.log('Buddy added successfully:', data.friend)
      
    } catch (error) {
      console.error('Error adding buddy:', error)
    }
  }

  const fetchBuddies = async (): Promise<Buddy[]> => {
    try {
      const res = await fetch('/api/buddies', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch buddies')
      const data = await res.json()
      console.log('Fetched buddies:', data)
      return data.map((b: Buddy) => ({
        ...b,
        courseIds: b.courseIds?.map(id => Number(id)) || []
      }))
    } catch (error) {
      console.error('Error fetching buddies:', error)
      return []
    }
  }

  const openChat = async (buddy: Buddy) => {
    if (openChats.some(chat => chat.buddy.id === buddy.id)) {
      setShowMobileChats(true)
      return
    }
    
    try {
      const res = await fetch(`/api/messages?contactId=${buddy.id}`)
      if (!res.ok) throw new Error('Failed to load messages')
      const messages = await res.json()
      
      setOpenChats(prev => [...prev, { buddy, messages }])
      setChatInputs(prev => ({ ...prev, [buddy.id]: '' }))
      setShowMobileChats(true)
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

  const buddiesInCommon = selectedCourse
    ? buddies.filter(b => 
        b.courseIds?.some(courseId => Number(courseId) === Number(selectedCourse.id))
    )
    : []

  return (
    <div className={styles.wrapper}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        {/* <button className={styles.searchIcon} onClick={() => {}}>
          <FiSearch />
        </button> */}
      </div>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <div className={styles.dropdownWrapper}>
          <button className={styles.navItem} onClick={() => setProfileDropdownOpen(p => !p)}>
            Profile ▾
          </button>
          {profileDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={() => router.push('/profile')}>
                View Profile
              </button>
              <button className={styles.dropdownItem} onClick={() => router.push('/availability')}>
                My Study Availability
              </button>
            </div>
          )}
        </div>
        <button className={styles.navItem}>Courses</button>
        <button className={styles.navItem} onClick={() => router.push('/buddies')}>
          Buddies
        </button>
        <button className={styles.navItem} onClick={() => router.push('/messages')}>
          Messages
        </button>
        <button className={styles.navItem} onClick={async () => {
          try {
            const res = await fetch('/api/logout', { method: 'POST' })
            if (res.ok) router.push('/register')
          } catch (error) {
            console.error('Logout error:', error)
          }
        }}>
          Logout
        </button>
      </aside>

      {/* Desktop Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.welcomeMessage}>Hello, {profile.name.split(' ')[0]} 👋 Here is your dashboard!</h2>
        </div>
        <h1 className={styles.logo}>Study Buddy</h1>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <h3 className={styles.sectionTitle}>Current Courses</h3>
        <div className={styles.coursesContainer}>
          {courses.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())).map(c => (
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
          <div className={styles.modalOverlay} onClick={() => setSelectedCourse(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{selectedCourse.title}</h2>
                <button onClick={() => setSelectedCourse(null)} className={styles.modalClose}>
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalDescription}>{selectedCourse.description}</p>
              </div>
              <div className={styles.modalFooter}>
                <h3>Buddies taking this course:</h3>
                {buddiesInCommon.length > 0 ? (
                  <ul className={styles.modalBuddyList}>
                    {buddiesInCommon.map(b => (
                      <li key={b.id} className={styles.modalBuddyItem}>
                        <div className={styles.buddyAvatar}>
                          {b.avatarUrl ? (
                            <img src={b.avatarUrl} alt={b.name} className={styles.buddyAvatarImage} />
                          ) : (
                            <span className={styles.buddyAvatarInitial}>{b.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className={styles.buddyInfo}>
                          <span className={styles.buddyName}>{b.name}</span>
                          <button 
                            className={styles.messageButton}
                            onClick={() => openChat(b)}
                          >
                            <FiMessageSquare size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.noBuddies}>No buddies taking this course yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Match with other Buddies!</h3>
          {loadingMatches ? (
            <p>Loading potential matches...</p>
          ) : potentialBuddies.length === 0 ? (
            <p>No potential matches found. Add more courses to find study buddies!</p>
          ) : (
            <div className={styles.buddiesGrid}>
              {potentialBuddies.map(buddy => (
                <div key={buddy.id} className={styles.buddyCard}>
                  <div className={styles.buddyHeader}>
                    <div className={styles.buddyAvatar}>
                      {buddy.avatarUrl ? (
                        <img src={buddy.avatarUrl} alt={buddy.name} />
                      ) : (
                        <span>{buddy.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className={styles.buddyName}>{buddy.name}</span>
                  </div>
                  
                  <div className={styles.commonCourses}>
                    <h4>Common Courses:</h4>
                    <ul>
                      {buddy.courses?.map(course => (
                        <li key={course.id} className={styles.courseItem}>
                          <span 
                            className={styles.courseColor} 
                            style={{ backgroundColor: course.color || '#ccc' }}
                          />
                          {course.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.buddyActions}>
                    <button
                      className={styles.addBuddyButton}
                      onClick={() => addBuddy(buddy.id)}
                    >
                      Add Buddy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Chat Windows */}
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
                ref={el => {
                  if (el) chatBodyRefs.current[buddy.id] = el
                }}
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
                  onChange={e => {
                    const newInputs = {...chatInputs}
                    newInputs[buddy.id] = e.target.value
                    setChatInputs(newInputs)
                  }}
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

      {/* Desktop Buddies Sidebar */}
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

      {/* Mobile Chats View */}
      {showMobileChats && (
  <div className={styles.mobileChatsContainer}>
    {activeMobileChat ? (
      <div className={styles.mobileChatActive}>
        <div className={styles.mobileChatHeader}>
          <button 
            className={styles.mobileChatBackButton}
            onClick={() => setActiveMobileChat(null)}
          >
            <FiChevronLeft size={20} /> Back
          </button>
          <div className={styles.mobileChatTitle}>
            {activeMobileChat.name}
          </div>
        </div>
        
        <div className={styles.mobileChatBody}>
          {openChats.find(chat => chat.buddy.id === activeMobileChat.id)?.messages.map(msg => {
            const isMyMessage = msg.senderId !== activeMobileChat.id;
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
            );
          })}
        </div>
        
        <div className={styles.mobileChatInput}>
          <input
            type="text"
            value={chatInputs[activeMobileChat.id] || ''}
            onChange={e => {
              const newInputs = {...chatInputs};
              newInputs[activeMobileChat.id] = e.target.value;
              setChatInputs(newInputs);
            }}
            onKeyDown={e => e.key === 'Enter' && sendMessage(activeMobileChat.id)}
            placeholder="Type a message..."
            className={styles.chatInputField}
          />
          <button 
            onClick={() => sendMessage(activeMobileChat.id)} 
            className={styles.chatSendButton}
            disabled={!chatInputs[activeMobileChat.id]?.trim()}
          >
            Send
          </button>
        </div>
      </div>
    ) : (
      <>
        <button 
          className={styles.closeMobileChats}
          onClick={() => setShowMobileChats(false)}
        >
          <FiX /> Back to Dashboard
        </button>
        
        <div className={styles.mobileBuddies}>
          <h3 className={styles.sectionTitle}>Messages</h3>
          {loading ? (
            <p>Loading...</p>
          ) : buddies.length === 0 ? (
            <p>No conversations yet</p>
          ) : (
            <div className={styles.mobileBuddyList}>
              {buddies.map(b => (
                <div 
                  key={b.id} 
                  className={styles.mobileBuddyItem}
                  onClick={() => {
                    openChat(b);
                    setActiveMobileChat(b);
                  }}
                >
                  <div className={styles.buddyAvatar}>
                    {b.avatarUrl ? (
                      <img src={b.avatarUrl} alt={b.name} />
                    ) : (
                      <span>{b.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.buddyInfo}>
                    <span className={styles.buddyName}>{b.name}</span>
                    <span className={styles.lastMessage}>
                      {openChats.find(c => c.buddy.id === b.id)?.messages.slice(-1)[0]?.text || 'No messages yet'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}

      {/* Mobile Navigation */}
      <div className={styles.mobileHeader}>
  <h1 className={styles.mobileLogo}>Study Buddy</h1>
</div>
      <div className={styles.mobileNav}>
        <button onClick={() => router.push('/')}>
          <FiLogOut />
        </button>
        <button 
          onClick={() => setShowMobileChats(!showMobileChats)}
          className={showMobileChats ? styles.active : ''}
        >
          <FiMessageSquare />
        </button>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setMobileMenuOpen(m => !m)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          <h2 className={styles.sidebarTitle}>My Dashboard</h2>
          <button
            className={styles.navItem}
            onClick={() => setProfileDropdownOpen(p => !p)}
          >
            Profile ▾
          </button>
          {profileDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button
                className={styles.dropdownItem}
                onClick={() => router.push('/profile')}
              >
                View Profile
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => router.push('/availability')}
              >
                Your Study Availability
              </button>
            </div>
          )}
          <button className={styles.navItem}>Courses</button>
          <button className={styles.navItem}>Buddies</button>
          <button className={styles.navItem} onClick={() => router.push('/messages')}>
            Messages
          </button>
        </div>
      )}
    </div>
  )
}