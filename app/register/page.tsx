// app/register/page.tsx
'use client'

import { useState } from 'react'
import RegisterForm from '../components/Auth/RegisterForm'
import LoginForm from '../components/Auth/LoginForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'register' | 'login'>('register')

  return (
    <div className="page-wrapper">
      <div className="auth-container">
        <h1 className="app-title">Study Buddy</h1>
        
        <div className="tab-container">
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Create Account
          </button>
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
        </div>

        <div className="form-content">
          {mode === 'register' ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .app-title {
          text-align: center;
          margin: 1.5rem 0 0.5rem;
          font-size: 2rem;
          font-weight: 700;
          color: #34495e;
          letter-spacing: -0.5px;
        }

        .tab-container {
          display: flex;
          margin: 0 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab {
          flex: 1;
          padding: 0.75rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .tab.active {
          color: #34495e;
          position: relative;
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #34495e;
          animation: slideIn 0.3s ease-out;
        }

        .form-content {
          padding: 0.25rem 2rem 1.5rem; /* Минимальный отступ сверху */
        }

        @keyframes slideIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @media (max-width: 480px) {
          .auth-container {
            max-width: 100%;
            border-radius: 0;
          }
          
          .form-content {
            padding: 0.25rem 1.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}