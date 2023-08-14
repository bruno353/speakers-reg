/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Checkbox from '@material-ui/core/Checkbox'
import { useForm, Controller } from 'react-hook-form'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import { Range } from 'react-range'
import { TextField, Autocomplete } from '@mui/material'
import { Slider } from 'rsuite'
import Decimal from 'decimal.js'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
  watchContractEvent,
} from '@wagmi/core'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import axios from 'axios'
import { Link, TasksOverview } from '@/types/task'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HeroTask from '../TaskView/HeroTask'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

type TaskApplicationForm = {
  displayName: string
  description: string
  githubLink: string
  additionalLink: string
  howLikelyToMeetTheDeadline: string
}

type Payment = {
  tokenContract: string
  amount: number
  nextToken: boolean
}

type IPFSSubmition = {
  displayName: string
  description: string
  budgetPercentageRequested: number
  howLikelyToMeetTheDeadline?: string | null
  links: Link[] | null
}

const TaskApplication = (id: any) => {
  Decimal.set({ precision: 60 })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isApplicationLoading, setIsApplicationLoading] =
    useState<boolean>(false)
  const [viewOption, setViewOption] = useState('projectDescription')
  const [taskChainData, setTaskChainData] = useState<any>()
  const [taskMetadata, setTaskMetadata] = useState<TasksOverview>()
  const [budgetView, setBudgetView] = useState<boolean>(false)
  const [budgetValue, setBudgetValue] = useState([100])
  const [budgetValueInputColor, setBudgetValueInputColor] =
    useState<String>('#009A50')
  const [estimatedBudgetRequested, setEstimatedBudgetRequested] =
    useState<String>('')
  const [budgetPercentage, setBudgetPercentage] = useState(100)
  const [howLikelyToMeetTheDeadlineValue, setHowLikelyToMeetTheDeadlineValue] =
    useState('')
  const colorsBudget = [
    '#39D303',
    '#31ce19',
    '#2aca24',
    '#22c52d',
    '#1ac033',
    '#12bc39',
    '#09b73e',
    '#01b242',
    '#00ad46',
    '#009A50',
    '#00a44c',
    '#009f4e',
    '#009a50',
    '#32973e',
    '#4a942b',
    '#5d9015',
    '#6e8c00',
    '#7e8700',
    '#8d8100',
    '#9c7a00',
    '#ab7200',
    '#b86900',
    '#c55e00',
    '#d15101',
    '#db421c',
  ]

  const rangePerColor = 250 / colorsBudget.length

  const [payments, setPayments] = useState<Payment[]>([])

  const [links, setLinks] = useState<Link[]>([
    { title: 'githubLink', url: '' },
    { title: 'additionalLink', url: '' },
  ])

  const getColor = (value) => {
    if (value < 50) {
      return 'bg-yellow-500'
    } else if (value > 150) {
      return 'bg-orange-500'
    } else {
      return 'bg-green-500'
    }
  }

  const { address } = useAccount()
  const { chain, chains } = useNetwork()

  const { push } = useRouter()

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS

  const howLikelyToMeetTheDeadlineOptions = [
    'Very unlikely',
    'Unlikely',
    'Likely',
    'Very likely',
  ]

  const handleLink = (
    index: number,
    field: keyof Link,
    valueReceived: string,
  ) => {
    const newLink = [...links]

    if (newLink[index][field].length >= 200) {
      return
    }

    const value = valueReceived

    newLink[index][field] = value
    setLinks(newLink)
  }

  const validSchema = Yup.object().shape({
    description: Yup.string().required('Desc is required'),
    additionalLink: Yup.string().notRequired(),
    howLikelyToMeetTheDeadline: Yup.string().notRequired(),
    githubLink: Yup.string().notRequired(),
    displayName: Yup.string().notRequired(),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<TaskApplicationForm>({
    resolver: yupResolver(validSchema),
  })

  async function formsUploadIPFS(data: IPFSSubmition) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/uploadIPFSMetadataTaskApplication`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }

    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
        console.log(dado)
      }
    })

    return dado
  }

  const toggleBudgetView = () => {
    setBudgetView(!budgetView)
  }

  async function getTaskFromChain(id: any) {
    setIsLoading(true)
    console.log('getting data from task')
    let data
    try {
      data = await readContract({
        address: `0x${taskAddress.substring(2)}`,
        abi: taskContractABI,
        args: [Number(id)],
        functionName: 'getTask',
      })
      setTaskChainData(data)
      setIsLoading(false)
    } catch (err) {
      toast.error('Task not found!')
      setIsLoading(false)
    }

    console.log('the data:')
    console.log(data)
  }

  async function getTask(taskId: string) {
    const data = {
      id: taskId,
    }
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getTask`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }
    try {
      await axios(config).then(function (response) {
        if (response.data) {
          console.log('here is the task')
          console.log(response.data)
          setTaskMetadata(response.data)
          setTaskChainData(response.data)
          setEstimatedBudgetRequested(
            Number(response.data.estimatedBudget).toLocaleString('en-US') ||
              '0',
          )
          // Treating payments
          const payments = response.data.payments.map((payment) => {
            const amountInNumber = Number(payment.amount)
            return {
              to: address,
              amount: amountInNumber,
              nextToken: true,
            }
          })

          // Removendo o campo 'decimals'
          payments.forEach((payment) => {
            delete payment.decimals
          })

          setPayments(payments)
          setIsLoading(false)
        }
      })
    } catch (err) {
      toast.error('Task not found!')
      setIsLoading(false)
    }
  }

  async function getEstimationTokens(
    taskId: string,
    percentage: number,
  ): Promise<Payment[]> {
    const data = {
      id: taskId,
      percentage,
    }
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getTokensNecessaryToFillRequest`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }
    try {
      const response = await axios(config)
      if (response.data) {
        console.log('here is the answer')
        console.log(response.data)
        // Treating payments
        const payments = response.data.payments.map((payment) => {
          const amountInNumber = Number(payment.amount)
          return {
            to: address,
            amount: amountInNumber,
            nextToken: true,
          }
        })

        // Removendo o campo 'decimals'
        payments.forEach((payment) => {
          delete payment.decimals
        })

        setPayments(payments)
        return payments
      } else {
        return null // return empty array when no data
      }
    } catch (err) {
      console.log(err)
      toast.error('error!')
      return null // return empty array in case of an error
    }
  }

  async function handleCreateApplication(
    taskId: number,
    metadata: string,
    budget: Payment[],
  ) {
    console.log('value to be sent')
    console.log(taskId['id'])
    console.log(metadata)
    console.log(budget)
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(taskId['id']), metadata, budget],
      functionName: 'applyForTask',
    })
    const { hash } = await writeContract(request)

    const data = await waitForTransaction({
      hash,
    })
    console.log('the data')
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 5500))
    if (data.status !== 'success') {
      throw data
    }
  }

  async function onSubmit(data: TaskApplicationForm) {
    console.log('submit called')
    if (chain && chain.name !== 'Polygon Mumbai') {
      toast.error('Please switch chain before interacting with the protocol.')
      return
    }

    setIsApplicationLoading(true)

    const { additionalLink, description } = data

    const finalData = {
      howLikelyToMeetTheDeadline: 'Likely',
      displayName: address,
      additionalLink,
      description,
      budgetPercentageRequested: budgetPercentage,
      links,
    }

    // eslint-disable-next-line no-unreachable
    let ipfsHashData
    try {
      const res = await formsUploadIPFS(finalData)
      console.log(res)
      ipfsHashData = res
    } catch (err) {
      console.log('ipfs error')
      toast.error('Error during the task application')
      console.log(err)
      setIsApplicationLoading(false)
      return
    }

    // based on the percentage the user is requiring, we are going to calculate how many tokens are necessary to fill its request
    const newPaymentsBasedOnPercentage: Payment[] = await getEstimationTokens(
      id.id,
      budgetPercentage,
    )
    console.log('final newPayment')
    console.log(newPaymentsBasedOnPercentage)
    if (!newPaymentsBasedOnPercentage) {
      setIsApplicationLoading(false)
      toast.error('Budget estimation')
      return
    }
    try {
      await handleCreateApplication(
        id,
        ipfsHashData,
        newPaymentsBasedOnPercentage,
      )
      toast.success('Application done succesfully!')
      push(`/task/${id.id}`)
      setIsApplicationLoading(false)
    } catch (err) {
      toast.error('Error during the task application')
      console.log(err)
      setIsApplicationLoading(false)
    }
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      console.log('search for the task info on blockchain')
      console.log(id.id)
      getTask(id.id)
    }
  }, [id])

  if (!address) {
    return (
      <div className="pb-[500px]">
        <div className="mt-[60px] flex items-center justify-center text-[#000000]">
          Connect you wallet to continue
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <section className="py-16 px-32 text-black md:py-20 lg:pt-40">
        <div className="container flex h-60 animate-pulse px-0 pb-12">
          <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
          <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
        </div>
        <div className="container h-96 animate-pulse bg-[#dfdfdf] pb-12"></div>
      </section>
    )
  }

  if (!isLoading && (!taskChainData || !taskMetadata)) {
    return (
      <section className="py-16 px-32 text-black md:py-20 lg:pt-40">
        <div className="container flex h-60 px-0 pb-[700px]">
          Task not found
        </div>
      </section>
    )
  }

  return (
    <>
      {taskMetadata && (
        <HeroTask
          task={taskMetadata}
          contributorsAllowed={null}
          address={address}
        />
      )}
      <section className="px-[100px] pt-[62px]  pb-[250px]">
        <div className="container px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="">
              <div>
                <p className="text-[20px] font-bold !leading-[120%] text-[#000000]">
                  Let’s get working!
                </p>
                <p className="mt-[30px] max-w-[854px] text-[16px] font-medium !leading-[140%] text-[#505050]">
                  We're on the hunt for the absolute best candidate to lead this
                  incredible project. We're eager to know, what makes you the
                  perfect person to steer this ship towards resounding success?
                </p>
                <div className="mt-[30px]">
                  <p className="text-[14px] font-medium !leading-[17px] text-[#000000]">
                    Display Name
                  </p>
                  <p
                    title={address}
                    className="mt-[10px] text-[14px] font-medium !leading-[17px] text-[#959595]"
                  >
                    {formatAddress(address)}
                  </p>
                </div>
                <div className="mt-[30px]">
                  <p className="text-[14px] font-medium !leading-[17px] text-[#000000]">
                    Links
                  </p>
                  <p
                    title={address}
                    className="mt-[10px] text-[14px] font-medium !leading-[17px] text-[#959595]"
                  >
                    www.github.com
                  </p>
                </div>
              </div>
              <div className="mt-[30px]">
                <p className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                  Budget
                </p>
                <div className="mt-[10px]">
                  <label className="text-[14px] text-[#C6C6C6]">
                    <Checkbox
                      checked={budgetView}
                      onChange={toggleBudgetView}
                      color="default"
                      inputProps={{ 'aria-label': '' }}
                    />
                    I’d like to amend the budget
                  </label>
                </div>
                {budgetView && (
                  <div className="mt-[25px]">
                    <div className="relative w-full">
                      <Range
                        step={25}
                        disabled={isApplicationLoading}
                        min={0}
                        max={250}
                        values={budgetValue}
                        onChange={(values) => {
                          setBudgetValue(values)
                          setBudgetValueInputColor(
                            colorsBudget[Math.floor(values[0] / rangePerColor)],
                          )
                          setEstimatedBudgetRequested(
                            Number(
                              new Decimal(taskChainData['estimatedBudget']).mul(
                                new Decimal(values[0] / 100),
                              ),
                            ).toLocaleString('en-US'),
                          )
                          setBudgetPercentage(values[0])
                        }}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '9px',
                              width: '500px',
                              backgroundColor: '#ffffff',
                              borderRadius: '4px',
                              border: '1.5px solid #D4D4D4',
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '33px',
                              backgroundColor: `${budgetValueInputColor}`,
                              borderRadius: '5px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <div className="px-[10px] text-[14px] font-bold text-[#ffffff]">
                              {budgetValue}%
                            </div>
                          </div>
                        )}
                      />
                      <Range
                        step={1}
                        disabled={isApplicationLoading}
                        min={0}
                        max={250}
                        values={budgetValue}
                        onChange={() => {}} // Its does nothing when changing
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '0',
                              width: '500px',
                              backgroundColor: 'transparent',
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '0',
                              width: '250px', // Aumente a largura conforme necessário
                              backgroundColor: 'transparent',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                              top: '40px', // Ajuste conforme necessário
                            }}
                          >
                            <div
                              className={`font-regular text-[12px] ${
                                estimatedBudgetRequested === '0' ? 'ml-14' : ''
                              }`}
                            >
                              {estimatedBudgetRequested === '0'
                                ? '❤️ Good choice! We thank you for your generosity for supporting our open initiative ❤️'
                                : ``}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    {estimatedBudgetRequested !== '0' ? (
                      <p className="mt-[25px] max-w-[654px] text-[14px] font-medium !leading-[17px] text-[#959595]">
                        Presenting a bid below the available funding can prove
                        your ability to deliver results while being
                        cost-effective
                      </p>
                    ) : (
                      <div className="h-[60px]"></div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-[30px]">
                <p className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                  What sets you apart and makes you the ideal candidate for this
                  task?{' '}
                  <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                    {errors.description?.message}
                  </p>
                </p>
                <textarea
                  disabled={isApplicationLoading}
                  style={{ resize: 'none' }}
                  className="mt-[10px] h-[159px] w-[800px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] py-[12px] text-[12px] font-normal !leading-[17px] outline-0"
                  maxLength={2000}
                  placeholder="Type here"
                  {...register('description')}
                />
              </div>
              <div className="mt-[30px]">
                <span className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                  Additional links if needed
                  <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                    {errors.additionalLink?.message}
                  </p>
                </span>
                <input
                  type="text"
                  disabled={isApplicationLoading}
                  maxLength={200}
                  {...register('additionalLink')}
                  onChange={(e) => handleLink(1, 'url', e.target.value)}
                  className="mt-[8px] h-[41px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[12px] font-normal !leading-[17px] outline-0"
                />
              </div>
            </div>

            <div className="mt-[30px]">
              <button
                type="submit"
                className={`rounded-[10px] bg-[#12AD50] py-[12px] px-[25px] text-[18px] font-bold  text-white hover:bg-[#0e7a39] ${
                  isApplicationLoading ? 'bg-[#7deba9] hover:bg-[#7deba9]' : ''
                }`}
                disabled={isApplicationLoading}
                onClick={handleSubmit(onSubmit)}
              >
                <span className="">Apply now</span>
              </button>
            </div>
            <div className=" mt-[30px] flex w-[850px] rounded-md bg-[#F5F5F5] py-[43px]  pl-[49px] text-center text-[16px] font-medium !leading-[19px] text-[#505050]">
              <p>
                | Have more questions? Reach out to{' '}
                <a
                  href="https://mumbai.polygonscan.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-[#0084FE] text-[#0084FE]"
                >
                  a verified contributor
                </a>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default TaskApplication
