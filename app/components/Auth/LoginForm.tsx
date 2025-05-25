'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } else {
      alert(data.error || 'Failed to login')
    }
  } catch (err) {
    alert('Network error')
  }
}


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          aria-label="Email"
        />
        <label className={styles.label}>Email</label>
      </div>

      <div className={styles.formGroup}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          aria-label="Password"
        />
        <label className={styles.label}>Password</label>
      </div>

      <button type="submit" className={styles.button}>
        Sign In
      </button>
    </form>
  )
}