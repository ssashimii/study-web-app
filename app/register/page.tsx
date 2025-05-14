// app/register/page.tsx
'use client'

import { useState } from 'react'
import RegisterForm from '../components/Auth/RegisterForm'
import LoginForm from '../components/Auth/LoginForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'register' | 'login'>('register')

  return (
    <div className="pageWrapper">
      <div className="tabContainer">
        <button
          className={mode === 'register' ? 'activeTab' : 'tab'}
          onClick={() => setMode('register')}
        >
          Register
        </button>
        <button
          className={mode === 'login' ? 'activeTab' : 'tab'}
          onClick={() => setMode('login')}
        >
          Login
        </button>
      </div>

      <div className="formContainer">
        {mode === 'register' ? <RegisterForm /> : <LoginForm />}
      </div>

      <style jsx global>{`
        html, body, #__next {
          height: 100%;
          margin: 0;
        }
        .pageWrapper {
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 1rem;
        }
        .tabContainer {
          display: flex;
          margin-bottom: 1.5rem;
          background: #111;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .tab, .activeTab {
          flex: 1;
          padding: 0.75rem;
          font-size: 1rem;
          color: #fff;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .activeTab {
          background: #222;
        }
        .formContainer {
          /* ensures forms stay same width */
          width: 100%;
          max-width: 320px;
        }
      `}</style>
    </div>
  )
}
