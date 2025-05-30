'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './availability.module.css'
import { FiMenu, FiX } from 'react-icons/fi'

type Availability = {
  day: string
  from: string
  to: string
  topic?: string
  user?: { firstName: string; lastName: string }
}

export default function AvailabilityPage() {
  const router = useRouter()
  const [myAvailabilities, setMyAvailabilities] = useState<Availability[]>([])
  const [allAvailabilities, setAllAvailabilities] = useState<Availability[]>([])
  const [newEntry, setNewEntry] = useState({ day: '', from: '', to: '', topic: '' })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/availability').then(r => r.json()).then(setMyAvailabilities)
    fetch('/api/availability/others').then(r => r.json()).then(setAllAvailabilities)
  }, [])

  const handleAdd = async () => {
    const { day, from, to, topic } = newEntry
    if (!day || !from || !to) {
      alert('Please fill all required fields')
      return
    }
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, from, to, topic }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || res.statusText)
    } else {
      setNewEntry({ day: '', from: '', to: '', topic: '' })
      // refresh
      const mine = await (await fetch('/api/availability')).json()
      const all  = await (await fetch('/api/availability/others')).json()
      setMyAvailabilities(mine)
      setAllAvailabilities(all)
    }
  }

  const friendsAvail = allAvailabilities.filter(a =>
    !myAvailabilities.some(m =>
      m.day === a.day && m.from === a.from && m.to === a.to && m.topic === a.topic
    )
  )

  return (
    <div className={styles.wrapper}>
      {/* DESKTOP SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <Link href="/profile"   className={styles.navItem}>Profile</Link>
        <Link href="/courses"   className={styles.navItem}>Courses</Link>
        <Link href="/buddies"   className={styles.navItem}>Buddies</Link>
        <Link href="/messages"  className={styles.navItem}>Messages</Link>
        <Link href="/availability" className={`${styles.navItem} ${styles.active}`}>Availability</Link>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <button className={styles.backButton} onClick={() => router.push('/dashboard')}>
          <span className={styles.backArrow}>←</span> Back
        </button>

        <section className={styles.addSection}>
          <h2 className={styles.title}>Add Availability</h2>
          <div className={styles.form}>
            <input type="date"   value={newEntry.day}   onChange={e => setNewEntry({...newEntry, day: e.target.value})}   className={styles.input}/>
            <input type="time"   value={newEntry.from}  onChange={e => setNewEntry({...newEntry, from: e.target.value})}  className={styles.input}/>
            <input type="time"   value={newEntry.to}    onChange={e => setNewEntry({...newEntry, to: e.target.value})}    className={styles.input}/>
            <input               placeholder="Topic (optional)" value={newEntry.topic} onChange={e => setNewEntry({...newEntry, topic: e.target.value})} className={styles.input}/>
            <button onClick={handleAdd} className={styles.button}>Add Availability</button>
          </div>
        </section>

        <section className={styles.bottomRow}>
          <div className={styles.leftColumn}>
            <h2 className={styles.title}>My Availability</h2>
            <div className={styles.list}>
              {myAvailabilities.length === 0 && <p>No availability found.</p>}
              {myAvailabilities.map((e,i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryContent}>
                    <div><strong>📅 Day:</strong> {e.day}</div>
                    <div><strong>⏰ From:</strong> {e.from}</div>
                    <div><strong>⏰ To:</strong> {e.to}</div>
                    {e.topic && <div><strong>📚 Topic:</strong> {e.topic}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.rightColumn}>
            <h2 className={styles.title}>Friends' Availability</h2>
            <div className={styles.list}>
              {friendsAvail.length === 0 && <p>No friends' availability.</p>}
              {friendsAvail.map((e,i) => (
                <div key={i} className={styles.entry}>
                  <div className={styles.entryContent}>
                    <div><strong>👤 User:</strong> {e.user?.firstName} {e.user?.lastName}</div>
                    <div><strong>📅 Day:</strong> {e.day}</div>
                    <div><strong>⏰ From:</strong> {e.from}</div>
                    <div><strong>⏰ To:</strong> {e.to}</div>
                    {e.topic && <div><strong>📚 Topic:</strong> {e.topic}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* MOBILE HAMBURGER */}
      <button
        className={styles.hamburgerBtn}
        onClick={() => setMobileMenuOpen(o => !o)}
        aria-label="Toggle Dashboard Menu"
      >
        {mobileMenuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
      </button>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          <Link href="/profile"   className={styles.navItem} onClick={()=>setMobileMenuOpen(false)}>Profile</Link>
          <Link href="/courses"   className={styles.navItem} onClick={()=>setMobileMenuOpen(false)}>Courses</Link>
          <Link href="/buddies"   className={styles.navItem} onClick={()=>setMobileMenuOpen(false)}>Buddies</Link>
          <Link href="/messages"  className={styles.navItem} onClick={()=>setMobileMenuOpen(false)}>Messages</Link>
          <Link href="/availability" className={`${styles.navItem} ${styles.active}`} onClick={()=>setMobileMenuOpen(false)}>Availability</Link>
        </div>
      )}
    </div>
  )
}
