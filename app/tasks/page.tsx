/* eslint-disable no-unused-vars */
import ScrollUp from '@/components/Common/ScrollUp'
import { Inter } from '@next/font/google'
import EmblaCarousel from '@/components/Carousel'
import TransactionList from '@/components/TasksOverview2'

// eslint-disable-next-line no-unused-vars
const inter = Inter({ subsets: ['latin'] })

export default function Tasks() {
  return (
    <>
      <ScrollUp />
      <TransactionList />
    </>
  )
}
