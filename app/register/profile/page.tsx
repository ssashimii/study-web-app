'use client'

import { useSearchParams } from 'next/navigation'
import ProfileForm from '../../components/Profile/ProfileForm'
import { Suspense } from 'react'

function ProfilePageContent() {
  const searchParams = useSearchParams()
  const fullName = searchParams.get('fullName') ?? ''

  return (
    <div className="pageWrapper">
      <ProfileForm studentName={fullName} />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
      <style jsx global>{`
        html, body, #__next {
          height: 100%;
          margin: 0;
        }
        .pageWrapper {
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 1rem;
        }
      `}</style>
    </Suspense>
  )
}