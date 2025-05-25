'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './RegisterForm.module.css'

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    sessionStorage.setItem('registerData', JSON.stringify({ firstName, lastName, email, password }))
    router.push('/register/profile')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={styles.input}
          required
          aria-label="First name"
          placeholder="First Name"  // вот тут плейсхолдер
        />
      </div>

      <div className={styles.formGroup}>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={styles.input}
          required
          aria-label="Last name"
          placeholder="Last Name"  // плейсхолдер
        />
      </div>

      <div className={styles.formGroup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          aria-label="Email"
          placeholder="Email"  // плейсхолдер для почты
        />
      </div>

      <div className={styles.formGroup}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          aria-label="Password"
          placeholder="Password"  // плейсхолдер для пароля
        />
      </div>

      <button type="submit" className={styles.button}>
        Create Account
      </button>
    </form>
  )
}
