'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [email, setEmail]       = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // TODO: call your login API here
    console.log({ email, password })

    // On successful login, navigate to the dashboard
    router.push('/dashboard')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Study Buddy</h1>
      <h2 className={styles.subtitle}>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        className={styles.input}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
        className={styles.input}
        required
      />

      <button type="submit" className={styles.button}>
        Login
      </button>
    </form>
  )
}
