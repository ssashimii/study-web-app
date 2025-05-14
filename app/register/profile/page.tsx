// app/register/profile/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import ProfileForm from '../../components/Profile/ProfileForm'

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const fullName = searchParams.get('fullName') ?? ''

  return (
    <div className="pageWrapper">
      <ProfileForm studentName={fullName} />

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
    </div>
  )
}
