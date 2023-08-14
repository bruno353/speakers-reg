'use client'

import ScrollUp from '@/components/Common/ScrollUp'
import EditProfile from '@/components/EditProfile'
import { Inter } from '@next/font/google'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function UserPage() {
  return (
    <>
      <ScrollUp />
      <EditProfile />
    </>
  )
}
