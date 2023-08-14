/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { UserOutlined } from '@ant-design/icons'
import TransactionList from '../TaskTransactionsList'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from '@wagmi/core'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Payment = {
  tokenContract: string
  amount: string
}

type Link = {
  title: string
  url: string
}

type IPFSSubmition = {
  title: string
  description: string
  deadline: Date
  departament: string
  skills: string[]
  type: string
  payments: Payment[]
  links: Link[] | null
  file: string | null
}

const TaskView = (id: any) => {
  const [filteredTasks, setFilteredTasks] = useState([])
  const [departament, setDepartament] = useState('All')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imgTaskIPFS, setImgTaskIPFS] = useState<String>('')
  const [taskMetadata, setTaskMetadata] = useState<IPFSSubmition>()

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS

  async function getTaskFromChain(id: any) {
    setIsLoading(true)
    console.log('getting data from task')
    const data = await readContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(id)],
      functionName: 'getTask',
    })
    console.log('the data:')
    console.log(data)
  }

  async function getDataFromIPFS(hash: string) {
    const url = `https://cloudflare-ipfs.com/ipfs/${hash}`

    await axios
      .get(url)
      .then((response) => {
        console.log('the metadata:')
        console.log(response.data)
        if (response.data.file) {
          setImgTaskIPFS(response.data.file)
        }
        setTaskMetadata(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error('Something occurred while fetching data from IPFS!')
      })
  }

  useEffect(() => {
    if (id) {
      console.log('search for the task info on blockchain')
      console.log(id)
      getTaskFromChain(id)
    }
  }, [id])
  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  // mock data for task
  const task = [
    {
      id: 1,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Trading research',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['Ai', 'Blockchain', 'Science'],
      departament: 'Data and analytics',
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Open',
      budget: ['250 USDT'],
    },
  ]

  return (
    <section className="py-16 px-32 text-black md:py-20 lg:pt-40">
      <div className="container  border-b border-[#8d8d8d] pb-12">
        <div className="-mx-4 flex flex-wrap items-start">
          <div className="w-full px-4">
            <div className="wow fadeInUp" data-wow-delay=".2s">
              <div className="mb-1">
                <h3 className="mb-4 text-xl font-normal  sm:text-3xl lg:text-4xl xl:text-5xl">
                  {taskMetadata.title}
                </h3>
                <div className="mt-10 flex text-[#595959]">
                  <p>Available funds</p>{' '}
                  <div className="ml-4 flex items-start justify-start px-2">
                    <img
                      src="/images/tokens/usd-coin-usdc-logo.svg"
                      alt="image"
                      className={`w-[22px]`}
                    />
                    <span className="ml-1 text-base text-[#000000]">1,200</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="mt-14 flex">
                    <button className="mr-8 border border-[#0057E1] bg-[#0057E1] px-3 py-1 text-sm text-white hover:border-[#0057E1] hover:bg-white hover:text-[#0057E1]">
                      {' '}
                      Start working{' '}
                    </button>
                    <button className="border bg-white px-3 py-1 text-sm text-[#0057E1] hover:border-white hover:bg-[#0057E1] hover:text-white">
                      {' '}
                      View on Github{' '}
                    </button>
                  </div>
                  <div className="">
                    <div className="flex justify-end">
                      {' '}
                      <img
                        src="/images/task/bola-teste.svg"
                        alt="image"
                        className={`w-[34px]`}
                      />
                      <p className=""> Open</p>
                    </div>

                    <p className="mt-8 text-[#595959]"> Deadline: 10-08-2023</p>
                  </div>
                </div>
                <div className="mt-14 flex">
                  <p className=" text-[#595959]">Project scope</p>
                  <div className="ml-16 flex space-x-2">
                    {task[0].categories.map((category, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-[#01E2AC] px-2 py-1 text-[11px] font-bold text-[#000000]"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex">
                  <p className=" text-[#595959]">Main contributors</p>
                  <div className="ml-8 flex space-x-2">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://mumbai.polygonscan.com/address/${task[0].submitter}`}
                      className="mt-1 flex hover:text-primary"
                    >
                      <UserOutlined />
                      <p
                        className="overflow-hidden text-xs font-semibold line-clamp-5 lg:text-xs lg:line-clamp-6"
                        title={task[0].submitter}
                      >
                        {formatAddress(task[0].submitter)}
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container  mt-12">
        <div className="-mx-4 flex flex-wrap items-start">
          <div className="w-full px-4">
            <div className="wow fadeInUp" data-wow-delay=".2s">
              <div className="mb-1">
                <p className="mb-4 text-xl font-bold  sm:text-3xl lg:text-xl">
                  Project description
                </p>
                <div className="flex">
                  <div className="mt-10 w-3/4 text-sm font-light">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/gBJ2QilHDXo"
                      allowFullScreen
                      frameBorder="0"
                      allow="encrypted-media"
                      className="h-[375px] w-4/5"
                    ></iframe>
                    <p className="mt-16">
                      Autofarm is a one-stop DeFi suite comprising of 6 main
                      products (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline. Autofarm is a
                      one-stop DeFi suite comprising of 6 main products
                      (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline.
                    </p>
                    <p className="mt-2">
                      Autofarm is a one-stop DeFi suite comprising of 6 main
                      products (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline. Autofarm is a
                      one-stop DeFi suite comprising of 6 main products
                      (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline. Autofarm is a
                      one-stop DeFi suite comprising of 6 main products
                      (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline. Autofarm is a
                      one-stop DeFi suite comprising of 6 main products
                      (Autofarm - yield optimizer/vaults, AutoSwap DEX
                      Aggregator, AutoPortfolio, AutoTrade, AutoAnalytics &
                      farmfolio - intelligent portfolio dashboard). Autofarm
                      ecosystem is currently available on BSC, HECO, Polygon,
                      Avalanche, Fantom, Moonriver, OKEx, Celo & Cronos with
                      Arbitrium, xDai, Harmony in the pipeline.
                    </p>
                    <img
                      src="/images/task/tech-fluxograma.png"
                      alt="image"
                      className={`mt-16 w-4/5`}
                    />
                    <p className="mt-14 text-xl font-semibold">
                      Relevant links
                    </p>
                    <p className="mt-1">
                      <a
                        href="https://www.figma.com/file/AEfyqvQLZ5XxlWfi1mehzT/[Popcorn]-Website?node-id=2641%3A23948"
                        className="mt-2"
                      >
                        https://www.figma.com/file/AEfyqvQLZ5XxlWfi1mehzT/[Popcorn]-Website?node-id=2641%3A23948
                      </a>
                    </p>
                    <p className="mt-1">
                      <a
                        href="https://bayc-onboarding.netlify.app/"
                        className=""
                      >
                        Site preview: https://bayc-onboarding.netlify.app/
                      </a>
                    </p>
                    <p className="mt-1">
                      <a
                        href="https://github.com/popcorndao/bayc-onboarding"
                        className=""
                      >
                        Repository:
                        https://github.com/popcorndao/bayc-onboarding{' '}
                      </a>
                    </p>
                  </div>
                  <div className="w-1/4 pl-20 text-base font-normal text-[#363636]">
                    <p>View project calendar</p>
                    <a
                      href="https://calendar.google.com/calendar/u/0/r"
                      target="_blank"
                      rel="nofollow noreferrer"
                    >
                      <img
                        src="/images/task/calendar-google-2.png"
                        alt="image"
                        className={`mt-4 ml-1 w-[70px] hover:z-20 hover:scale-110`}
                      />
                    </a>
                    <div className="mt-12 text-sm">
                      <p>10:30 PM UTC 23-12-2021</p>
                      <p>Next meeting</p>
                    </div>
                    <div className="mt-12 text-sm">
                      <p>Talk to contributors</p>
                      <a
                        href="https://discord.gg/JppWPVjt"
                        target="_blank"
                        rel="nofollow noreferrer"
                      >
                        <img
                          src="/images/task/discord.svg"
                          alt="image"
                          className={`mt-4 ml-1 w-[40px] hover:z-20 hover:scale-110`}
                        />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-20">
                  <TransactionList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TaskView
