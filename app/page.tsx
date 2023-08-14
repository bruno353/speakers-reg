/* eslint-disable no-unused-vars */
import AboutSectionOne from '@/components/About/AboutSectionOne'
import AboutSectionTwo from '@/components/About/AboutSectionTwo'
import Blog from '@/components/Blog'
import Brands from '@/components/Brands'
import ScrollUp from '@/components/Common/ScrollUp'
import Contact from '@/components/Contact'
import Features from '@/components/Features'
import Hero from '@/components/Hero'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import Video from '@/components/Video'
import { Inter } from '@next/font/google'
import EmblaCarousel from '@/components/Carousel'
import TransactionList from '@/components/TransactionList'
import DepartamentsList from '@/components/DepartamentsList'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      {/* <EmblaCarousel /> */}
      {/* <Features /> */}
      {/* <TransactionList /> */}
      {/* <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Blog />
      <Contact /> */}
    </>
  )
}
