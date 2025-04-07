'use client'
import './styles/auth.css'

import { useState } from 'react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-toggle">
          <button
            onClick={() => setMode('login')}
            className={`auth-toggle-button ${mode === 'login' ? 'active-login' : ''}`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`auth-toggle-button ${mode === 'register' ? 'active-register' : ''}`}
          >
            Register
          </button>
        </div>

        <form className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Password Confirmation</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
              />
            </div>
          )}

          <button type="submit" className="auth-submit">
            {mode === 'login' ? 'Enter' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
