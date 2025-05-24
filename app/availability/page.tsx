'use client'

import React, { useState } from 'react'
import styles from './availability.module.css'
import Link from 'next/link'
import { FiMessageSquare } from 'react-icons/fi'

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState([
    { name: 'Jane Doe', date: '2025-05-23', time: '10:00–12:00', topic: 'Math' },
    { name: 'Mike Smith', date: '2025-05-24', time: '14:00–16:00', topic: 'Physics' }
  ])

  const [newEntry, setNewEntry] = useState({
    name: '',
    date: '',
    time: '',
    topic: ''
  })

  const [openChatWith, setOpenChatWith] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ [key: string]: string[] }>({})
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
  if (!input.trim() || !openChatWith) return
  setMessages(prev => ({
    ...prev,
    [openChatWith]: [...(prev[openChatWith] || []), `You: ${input}`]
  }))
  setInput('')
}

  const handleAdd = () => {
    if (newEntry.name && newEntry.date && newEntry.time && newEntry.topic) {
      setAvailabilities(prev => [...prev, newEntry])
      setNewEntry({ name: '', date: '', time: '', topic: '' })
    }
  }

  const handleOpenChat = (name: string) => {
    setOpenChatWith(name)
  }

  const handleCloseChat = () => {
    setOpenChatWith(null)
  }

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <Link href="/profile" className={styles.navItem}>Profile</Link>
        <Link href="/courses" className={styles.navItem}>Courses</Link>
        <Link href="/buddies" className={styles.navItem}>Buddies</Link>
        <Link href="/messages" className={styles.navItem}>Messages</Link>
        <Link href="/settings" className={styles.navItem}>Settings</Link>
        <Link href="/" className={styles.navItem}>Logout</Link>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.title}>Availability Schedule</div>

        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Your name"
            value={newEntry.name}
            onChange={e => setNewEntry({ ...newEntry, name: e.target.value })}
          />
          <input
            className={styles.input}
            type="date"
            value={newEntry.date}
            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="e.g. 13:00–15:00"
            value={newEntry.time}
            onChange={e => setNewEntry({ ...newEntry, time: e.target.value })}
          />
          <input
            className={styles.input}
            placeholder="Topic"
            value={newEntry.topic}
            onChange={e => setNewEntry({ ...newEntry, topic: e.target.value })}
          />
          <button onClick={handleAdd} className={styles.button}>
            Add Availability
          </button>
        </div>

        <div className={styles.list}>
          {availabilities.map((entry, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryContent}>
                <div className={styles.entryLine}><strong>🧑‍🎓 Name:</strong> {entry.name}</div>
                <div className={styles.entryLine}><strong>📅 Date:</strong> {entry.date}</div>
                <div className={styles.entryLine}><strong>⏰ Time:</strong> {entry.time}</div>
                <div className={styles.entryLine}><strong>📚 Topic:</strong> {entry.topic}</div>
              </div>
              <button className={styles.messageBtn} onClick={() => handleOpenChat(entry.name)}>
                <FiMessageSquare />
              </button>
            </div>
          ))}
        </div>

        {openChatWith && (
          <div className={styles.chatPopup}>
            <div className={styles.chatHeader}>
              <span>Chat with {openChatWith}</span>
              <button onClick={handleCloseChat} className={styles.chatClose}>×</button>
            </div>
            <div className={styles.chatBody}>
              {messages[openChatWith]?.map((msg, i) => (
                <div key={i} className={styles.chatMessage}>{msg}</div>
          ))}
        </div>
        <div className={styles.chatInput}>
          <textarea
            className={styles.chatInputField}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            rows={2}
          />
          <button className={styles.chatSend} onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    )}

      </main>

      {/* Online Buddies */}
      <aside className={styles.buddies}>
        <h3 className={styles.sectionTitle}>Buddies Online</h3>
        <div className={styles.buddy}>
          <div className={styles.buddyAvatar} /> Jane Doe <FiMessageSquare />
        </div>
        <div className={styles.buddy}>
          <div className={styles.buddyAvatar} /> Mike Smith <FiMessageSquare />
        </div>
        <div className={styles.buddy}>
          <div className={styles.buddyAvatar} /> Nina Taylor <FiMessageSquare />
        </div>
      </aside>
    </div>
  )
}
