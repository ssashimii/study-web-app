'use client'

import React, { useEffect, useState } from 'react'
import styles from './Messages.module.css'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  firstName: string
  lastName: string
  avatar?: string
}

type Message = {
  id: number
  text: string
  senderId: number
  receiverId: number
  createdAt: string
}

export default function MessagesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.userId) setCurrentUserId(data.userId)
      })
  }, [])


  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])


  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    fetch(`/api/messages?contactId=${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
  }, [selectedUser, currentUserId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId) return

    const res = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: selectedUser.id,
        text: newMessage,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const newMsg = await res.json()
    setMessages(prev => [...prev, newMsg])
    setNewMessage('')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <button className={styles.backButton} onClick={() => router.push('/dashboard')}>
          ← Back
        </button>
        <h2>Messages</h2>
        <ul className={styles.userList}>
          {users.map(user => (
            <li key={user.id} onClick={() => setSelectedUser(user)}>
              {user.avatar && <img src={user.avatar} alt="avatar" className={styles.avatar} />}
              <span>
                {user.id === currentUserId ? 'Your own chat' : `${user.firstName} ${user.lastName}`}
              </span>
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.chatArea}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>
              Chat with {selectedUser.id === currentUserId ? 'yourself' : selectedUser.firstName}
            </div>

            <div className={styles.messageList}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${msg.senderId === currentUserId ? styles.own : ''}`}
                >
                  <div className={styles.messageContent}>
                    {msg.text}
                    <span className={styles.timestamp}>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.inputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>

          </>
        ) : (
          <div className={styles.placeholder}>
            Select a conversation to start chatting.
          </div>
        )}
      </main>
    </div>
  )
}