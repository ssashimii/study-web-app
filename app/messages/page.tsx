'use client'

import React, { useEffect, useState } from 'react'
import styles from './Messages.module.css'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  name: string
  avatarUrl: string
  unreadCount?: number
}

type Message = {
  id: number
  text: string
  senderId: number
  receiverId: number
  createdAt: string
  isRead: boolean
}

export default function MessagesPage() {
  const [friends, setFriends] = useState<User[]>([])
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null)
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
    if (!currentUserId) return

    fetch('/api/buddies')
      .then(res => res.json())
      .then(async (buddies) => {
        const formattedFriends = buddies.map((buddy: any) => ({
          id: buddy.id,
          name: buddy.name,
          avatarUrl: buddy.avatarUrl,
          unreadCount: 0
        }))

        const unreadResponse = await fetch('/api/messages/unread-count')
        const unreadCounts = await unreadResponse.json()

        const updatedFriends = formattedFriends.map((friend: { id: any }) => {
          const unreadData = unreadCounts.find((u: any) => u.senderId === friend.id)
          return {
            ...friend,
            unreadCount: unreadData?._count?._all || 0
          }
        })

        setFriends(updatedFriends)
      })

    const interval = setInterval(() => {
      fetch('/api/messages/unread-count')
        .then(res => res.json())
        .then(unreadCounts => {
          setFriends(prevFriends => 
            prevFriends.map(friend => {
              const unreadData = unreadCounts.find((u: any) => u.senderId === friend.id)
              return {
                ...friend,
                unreadCount: unreadData?._count?._all || 0
              }
            })
          )
        })
    }, 10000)

    return () => clearInterval(interval)
  }, [currentUserId])

  useEffect(() => {
    if (!selectedFriend || !currentUserId) return

    fetch(`/api/messages?contactId=${selectedFriend.id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data)
        
        if (data.some((msg: Message) => msg.senderId === selectedFriend.id && !msg.isRead)) {
          fetch('/api/messages/mark-as-read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senderId: selectedFriend.id })
          }).then(() => {
            setFriends(prevFriends => 
              prevFriends.map(friend => 
                friend.id === selectedFriend.id 
                  ? { ...friend, unreadCount: 0 } 
                  : friend
              )
            )
          })
        }
      })
  }, [selectedFriend, currentUserId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !currentUserId) return

    const res = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: selectedFriend.id,
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
          {friends.map(friend => (
            <li 
              key={friend.id} 
              onClick={() => setSelectedFriend(friend)}
              className={selectedFriend?.id === friend.id ? styles.selected : ''}
            >
              <img src={friend.avatarUrl} alt="avatar" className={styles.avatar} />
              <span>{friend.name}</span>
              {friend.unreadCount && friend.unreadCount > 0 ? (
                <span className={styles.unreadBadge}>
                  {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.chatArea}>
        {selectedFriend ? (
          <>
            <div className={styles.chatHeader}>
              Chat with {selectedFriend.name}
              {friends.find(f => f.id === selectedFriend.id)?.unreadCount ? (
                <span className={styles.unreadBadge}>
                  {friends.find(f => f.id === selectedFriend.id)?.unreadCount}
                </span>
              ) : null}
            </div>

            <div className={styles.messageList}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${msg.senderId === currentUserId ? styles.own : ''} ${!msg.isRead && msg.senderId !== currentUserId ? styles.unread : ''}`}
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
            Select a friend to start chatting.
          </div>
        )}
      </main>
    </div>
  )
}