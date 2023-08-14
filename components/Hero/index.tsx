/* eslint-disable react/no-unescaped-entities */
// import Image from 'next/image'
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Hero = () => {
  const { push } = useRouter()

  useEffect(() => push('/tasks'), [])

  return <section className="py-16 px-32 md:py-20 lg:pt-40"></section>
}

export default Hero
