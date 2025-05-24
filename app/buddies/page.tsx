'use client'

import React, { useState } from 'react'
import styles from './buddies.module.css'
import { FiMessageSquare, FiX } from 'react-icons/fi'
import Link from 'next/link'

const buddies = [
  {
    id: 1,
    name: 'Jane Doe',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    courses: ['Math', 'Literature'],
    studyPreference: 'Library',
    availability: [{ date: '2025-05-25', time: '10:00–12:00', topic: 'Math' }]
  },
  {
    id: 2,
    name: 'Mike Smith',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    courses: ['Music', 'Physics'],
    studyPreference: 'Cafe',
    availability: []
  },
  {
    id: 3,
    name: 'Eva Green',
    avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
    courses: ['Biology', 'Art History'],
    studyPreference: 'Home',
    availability: [{ date: '2025-05-27', time: '13:00–15:00', topic: 'Art History' }]
  },
  {
    id: 4,
    name: 'Nina Taylor',
    avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
    courses: ['Biology', 'Music'],
    studyPreference: 'Library',
    availability: []
  },
  {
    id: 5,
    name: 'Tom Clark',
    avatarUrl: 'https://randomuser.me/api/portraits/men/14.jpg',
    courses: ['Math', 'Physics'],
    studyPreference: 'Home',
    availability: [{ date: '2025-06-01', time: '09:00–11:00', topic: 'Physics' }]
  }
]

export default function BuddiesPage() {
  const [openChatWith, setOpenChatWith] = useState<string | null>(null)
  const [selectedBuddy, setSelectedBuddy] = useState<typeof buddies[0] | null>(null)

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <Link href="/profile" className={styles.navItem}>Profile</Link>
        <Link href="/courses" className={styles.navItem}>Courses</Link>
        <Link href="/buddies" className={`${styles.navItem} ${styles.active}`}>Buddies</Link>
        <Link href="/messages" className={styles.navItem}>Messages</Link>
        <Link href="/settings" className={styles.navItem}>Settings</Link>
        <Link href="/" className={styles.navItem}>Logout</Link>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <h1 className={styles.title}>My Buddies</h1>
        <div className={styles.grid}>
          {buddies.map(buddy => (
            <div key={buddy.id} className={styles.card}>
              <div className={styles.avatar}>
                <img src={buddy.avatarUrl} alt={buddy.name} />
              </div>
              <div className={styles.name}>{buddy.name}</div>
              <div className={styles.actions}>
                <button className={styles.viewBtn} onClick={() => setSelectedBuddy(buddy)}>
                  View Profile
                </button>
                <button className={styles.messageBtn} onClick={() => setOpenChatWith(buddy.name)}>
                  <FiMessageSquare />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Profile Popup */}
      {selectedBuddy && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBuddy(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                <img src={selectedBuddy.avatarUrl} alt={selectedBuddy.name} />
              </div>
              <h2>{selectedBuddy.name}</h2>
              <button onClick={() => setSelectedBuddy(null)} className={styles.modalClose}><FiX /></button>
            </div>
            <div className={styles.modalContent}>
              <p><strong>Courses:</strong></p>
              <ul>
                {selectedBuddy.courses.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p><strong>Study Preference:</strong> {selectedBuddy.studyPreference}</p>
              <p><strong>Availability:</strong></p>
              {selectedBuddy.availability.length > 0 ? (
                <ul>
                  {selectedBuddy.availability.map((a, i) => (
                    <li key={i}>
                      <strong>{a.date}</strong> — {a.time} ({a.topic})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No availability set</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Box */}
      {openChatWith && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            Chat with {openChatWith}
            <button onClick={() => setOpenChatWith(null)} className={styles.chatClose}><FiX /></button>
          </div>
          <div className={styles.chatBody}>
            <p>This is a demo chat window.</p>
          </div>
        </div>
      )}
    </div>
  )
}
