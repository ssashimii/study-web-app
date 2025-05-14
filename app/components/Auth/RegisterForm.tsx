// app/components/Auth/RegisterForm.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './RegisterForm.module.css'

export default function RegisterForm() {
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail]       = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const router = useRouter()

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: call your registration API here...
    console.log({ fullName, email, password })


   router.push(`/register/profile?fullName=${encodeURIComponent(fullName)}`)
  }


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Study Buddy</h1>
      <h2 className={styles.subtitle}>Register</h2>

      <input
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFullName(e.target.value)
        }
        className={styles.input}
        required
      />

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
        Register
      </button>
    </form>
  )
}
