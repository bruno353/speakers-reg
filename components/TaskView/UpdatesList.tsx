/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import {
  readContract,
  readContracts,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from '@wagmi/core'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Event } from '@/types/task'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import { File, SmileySad, Info } from 'phosphor-react'

type UpdatesListProps = {
  taskId: string
}

// eslint-disable-next-line prettier/prettier
const UpdatesList = ({taskId}: UpdatesListProps) => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const pathname = usePathname()

  const { push } = useRouter()

  const eventsNameFormatted = {
    ApplicationCreated: 'New application',
    TaskCreated: 'Task created',
    ApplicationAccepted: 'An application was accepted',
    TaskTaken: 'The task was taken',
    SubmissionCreated: 'New submission',
    SubmissionReviewed: 'New submission revision',
    TaskCompleted: 'The task was completed',
    BudgetIncreased: 'The budget was increased',
  }

  function formatDeadlineComplet(timestamp) {
    const dateInMilliseconds = parseInt(timestamp, 10) * 1000 // converta para milissegundos
    const formattedDeadline = format(
      new Date(dateInMilliseconds),
      "HH:mm:ss 'UTC', dd MMMM yyyy",
    )
    return formattedDeadline
  }

  async function handleEvents(id: string) {
    const dataBody = {
      id,
    }
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getTaskEvents`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data: dataBody,
    }

    try {
      await axios(config).then(function (response) {
        if (response.data) {
          setEvents(response.data.sort((a, b) => b.timestamp - a.timestamp))
        }
      })
    } catch (err) {
      toast.error('Error getting the updates!')
      console.log(err)
    }

    setIsLoading(false)
  }

  // When I want to scroll manually to the tasks
  const scrollManually = () => {
    const taskStartElement = document.getElementById('taskStart')
    taskStartElement.scrollIntoView({ behavior: 'smooth' })
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function NoEvents() {
    return (
      <div className="mr-[50px] flex w-full items-center justify-center">
        <SmileySad size={32} className="text-blue-500 mb-2" />
        <span className="">No updates found</span>
      </div>
    )
  }

  useEffect(() => {
    console.log('useEffect chamado')
    handleEvents(taskId)
  }, [taskId])

  if (isLoading) {
    return (
      <div className="mr-[50px] w-full">
        <div className="flex h-[150px] w-full animate-pulse rounded-[10px] bg-[#dfdfdf]"></div>
        <div className="mt-[25px] flex h-[150px] w-full animate-pulse rounded-[10px]  bg-[#dfdfdf]"></div>
      </div>
    )
  }

  if (events && events.length === 0) {
    return NoEvents()
  }

  return (
    <div className="mr-[50px] max-h-[1200px] w-full overflow-auto text-[14px] font-medium !leading-[19px] text-[#505050]">
      {!isLoading &&
        events.length > 0 &&
        events.map((event, index) => {
          return (
            <div
              className={`${
                index === 0 ? '' : 'mt-[25px]'
              } rounded-[10px] bg-[#F5F5F5] py-[40px] px-[35px]`}
              key={index}
            >
              <div className="flex">
                <div className="flex">
                  <img
                    alt="ethereum avatar"
                    src={`https://effigy.im/a/${event.address}.svg`}
                    className="mr-[10px] w-[25px] rounded-full"
                  ></img>
                  <a
                    className=" flex items-center text-[#505050] hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://mumbai.polygonscan.com/address/${event.address}`}
                  >
                    {formatAddress(event.address)}
                  </a>
                </div>
                <div className="ml-auto flex items-center font-normal">
                  {formatDeadlineComplet(event.timestamp)}
                </div>
              </div>
              <div className="mt-[15px] flex">
                <div className="flex">
                  <p className="ml-[35px] flex items-center text-[#000000] ">
                    {eventsNameFormatted[event.name]}
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <a
                    className=" flex items-center border-b-[1px] border-[#0354EC] text-[#0354EC] hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://mumbai.polygonscan.com/tx/${event.transactionHash}`}
                  >
                    View on Etherscan
                  </a>
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default UpdatesList
