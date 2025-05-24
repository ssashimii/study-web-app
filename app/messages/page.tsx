'use client'

import React from 'react'
import styles from './Messages.module.css'

export default function MessagesPage() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Messages</h2>
        {/* Add list of conversations here */}
      </aside>
      <main className={styles.chatArea}>
        <div className={styles.placeholder}>
          Select a conversation to start chatting.
        </div>
      </main>
    </div>
  )
}
