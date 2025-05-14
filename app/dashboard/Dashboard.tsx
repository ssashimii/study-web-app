'use client'

import { FiMessageCircle, FiHome, FiMessageSquare } from 'react-icons/fi'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const courses = Array.from({ length: 5 }, (_, i) => i)
  const buddies = ['Alice Johnson', 'Bob Smith']

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Dashboard</h2>
        <button className={styles.navItem}>Profile</button>
        <button className={styles.navItem}>Courses</button>
        <button className={styles.navItem}>Buddies</button>
      </aside>

      {/* Header (Search + TopNav) */}
      <header className={styles.header}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.topNav}>
          <FiMessageCircle className={styles.icon} />
          <FiHome className={styles.icon} />
          <div className={styles.profile}>
            <div className={styles.profileAvatar} />
            <div>
              <div className={styles.profileName}>Name Surname</div>
              <div className={styles.profileYear}>3rd year</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Courses */}
      <main className={styles.main}>
        <h3 className={styles.sectionTitle}>Current Courses</h3>
        <div className={styles.coursesGrid}>
          {courses.map((_, i) => (
            <div
              key={i}
              className={
                i === 4
                  ? `${styles.courseItem} ${styles.courseItemLarge}`
                  : styles.courseItem
              }
            />
          ))}
        </div>
      </main>

      {/* Buddies */}
      <aside className={styles.buddies}>
        <h3 className={styles.sectionTitle}>My Buddies</h3>
        {buddies.map((name, i) => (
          <div key={i} className={styles.buddy}>
            <div className={styles.buddyAvatar} />
            <div className={styles.buddyInfo}>
              <span className={styles.buddyName}>{name}</span>
              <button className={styles.buddyBtn}>
                <FiMessageSquare /> Text
              </button>
            </div>
          </div>
        ))}
      </aside>
    </div>
  )
}
