'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './availability.module.css'

type Availability = {
  day: string
  from: string
  to: string
  topic?: string
  user?: {
    firstName: string
    lastName: string
  }
}

export default function AvailabilityPage() {
  const router = useRouter()

  const [myAvailabilities, setMyAvailabilities] = useState<Availability[]>([])
  const [allAvailabilities, setAllAvailabilities] = useState<Availability[]>([])
  const [newEntry, setNewEntry] = useState({ day: '', from: '', to: '', topic: '' })

  const fetchMyAvailabilities = async () => {
    const res = await fetch('/api/availability')
    const data = await res.json()
    setMyAvailabilities(data)
  }

  const fetchAllAvailabilities = async () => {
    const res = await fetch('/api/all-availability')
    const data = await res.json()
    setAllAvailabilities(data)
  }

  useEffect(() => {
    fetchMyAvailabilities()
    fetchAllAvailabilities()
  }, [])

  const handleAdd = async () => {
    const { day, from, to, topic } = newEntry
    if (!day || !from || !to) {
      alert('Please fill all required fields')
      return
    }

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, from, to, topic }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert('Error: ' + (errorData.error || res.statusText))
        return
      }

      setNewEntry({ day: '', from: '', to: '', topic: '' })
      await fetchMyAvailabilities()
      await fetchAllAvailabilities()
    } catch (error) {
      alert('Network or unexpected error: ' + error)
    }
  }

  const friendsAvailabilities = allAvailabilities.filter(allEntry =>
    !myAvailabilities.some(myEntry =>
      myEntry.day === allEntry.day &&
      myEntry.from === allEntry.from &&
      myEntry.to === allEntry.to &&
      myEntry.topic === allEntry.topic
    )
  )

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>

        {}
        <button
          className={styles.backButton}
          onClick={() => router.push('/dashboard')}
          aria-label="Go back to dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            background: 'none',
            border: 'none',
            color: 'black',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {}
          <span style={{ fontSize: '20px', lineHeight: '1' }}>←</span> Back
        </button>

        {}
        <section className={styles.addSection}>
          <h2 className={styles.title}>Add Availability</h2>

          <div className={styles.form}>
            <input
              className={styles.input}
              type="date"
              value={newEntry.day}
              onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}
            />
            <input
              className={styles.input}
              type="time"
              value={newEntry.from}
              onChange={e => setNewEntry({ ...newEntry, from: e.target.value })}
            />
            <input
              className={styles.input}
              type="time"
              value={newEntry.to}
              onChange={e => setNewEntry({ ...newEntry, to: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder="Topic (optional)"
              value={newEntry.topic}
              onChange={e => setNewEntry({ ...newEntry, topic: e.target.value })}
            />
            <button onClick={handleAdd} className={styles.button}>
              Add Availability
            </button>
          </div>
        </section>

        {}
        <section className={styles.bottomRow}>
          {}
          <div className={styles.leftColumn}>
            <h2 className={styles.title}>My Availability</h2>
            <div className={styles.list}>
              {myAvailabilities.length === 0 && <p>No availability found.</p>}
              {myAvailabilities.map((entry, i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryContent}>
                    <div><strong>📅 Day:</strong> {entry.day}</div>
                    <div><strong>⏰ From:</strong> {entry.from}</div>
                    <div><strong>⏰ To:</strong> {entry.to}</div>
                    {entry.topic && <div><strong>📚 Topic:</strong> {entry.topic}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className={styles.rightColumn}>
            <h2 className={styles.title}>Friends' Availability</h2>
            <div className={styles.list}>
              {friendsAvailabilities.length === 0 && <p>No friends' availability found.</p>}
              {friendsAvailabilities.map((entry, i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryContent}>
                    <div><strong>👤 User:</strong> {entry.user?.firstName} {entry.user?.lastName}</div>
                    <div><strong>📅 Day:</strong> {entry.day}</div>
                    <div><strong>⏰ From:</strong> {entry.from}</div>
                    <div><strong>⏰ To:</strong> {entry.to}</div>
                    {entry.topic && <div><strong>📚 Topic:</strong> {entry.topic}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
