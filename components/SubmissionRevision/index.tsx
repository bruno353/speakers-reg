/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
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
import { Link, TasksOverview, Submission } from '@/types/task'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HeroTask from '../TaskView/HeroTask'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import HeroSubmission from './HeroSubmission'

type SubmissionRevisionForm = {
  description: string
  judgment: string
}

type Payment = {
  tokenContract: string
  amount: number
  nextToken: boolean
}

type IPFSSubmition = {
  description: string
  links: Link[] | null
}

const SubmissionRevision = (id: any) => {
  Decimal.set({ precision: 60 })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isApplicationLoading, setIsApplicationLoading] =
    useState<boolean>(false)
  const [judgment, setJudgment] = useState('')
  const [viewOption, setViewOption] = useState('projectDescription')
  const [taskChainData, setTaskChainData] = useState<any>()
  const [linksValues, setLinksValues] = useState([])
  const [taskMetadata, setTaskMetadata] = useState<TasksOverview>()
  const [submissionMetadata, setSubmissionMetadata] = useState<Submission>()
  const [budgetValue, setBudgetValue] = useState([100])
  const [budgetValueInputColor, setBudgetValueInputColor] =
    useState<String>('#009A50')
  const [estimatedBudgetRequested, setEstimatedBudgetRequested] =
    useState<String>('')
  const [contributorsAllowed, setContributorsAllowed] = useState([])
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

  const judgmentOptions = ['Accept', 'Reject']

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
    description: Yup.string().required('Feedback is required'),
    judgment: Yup.string().required('Judgment is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<SubmissionRevisionForm>({
    resolver: yupResolver(validSchema),
  })

  async function formsUploadIPFS(data: SubmissionRevisionForm) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/uploadIPFSMetadataTaskSubmissionRevision`,
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

  async function getSubmission(id: string) {
    const data = {
      id,
    }
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getSubmission`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }
    try {
      await axios(config).then(function (response) {
        if (response.data) {
          console.log('here is the submission')
          console.log(response.data)
          setTaskMetadata(response.data.task)
          setTaskChainData(response.data.task)
          // eslint-disable-next-line prettier/prettier
          setEstimatedBudgetRequested(Number(response.data.task.estimatedBudget).toLocaleString('en-US') || '0',)
          setBudgetValue([response.data.task.estimatedBudget])
          // Treating payments
          const payments = response.data.task.payments.map((payment) => {
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

          if (response.data.task['Application']) {
            const contributors = response.data.task['Application']
              .filter((app) => app.taken === true)
              .map((app) => app.applicant)

            setContributorsAllowed(contributors)
          }
          setSubmissionMetadata(response.data.submission)
          setPayments(payments)
          setIsLoading(false)
        }
      })
    } catch (err) {
      toast.error('Submission not found!')
      push('/')
      setIsLoading(false)
    }
  }

  const judgmentToIndexOptions = {
    Accept: 1,
    Reject: 2,
  }

  async function handleCreateSubmissionRevision(
    taskId: number,
    submissionId: string,
    metadata: string,
    judgment: string,
  ) {
    console.log('judgmetn here')
    console.log(judgment)
    console.log('value to be sent')
    console.log(taskId)
    console.log('value to be sent')
    console.log(metadata)
    console.log('value to be sent')
    console.log(judgmentToIndexOptions[judgment])
    console.log('value to be sent')
    console.log(submissionId)
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [
        taskId,
        Number(submissionId),
        judgmentToIndexOptions[judgment],
        metadata,
      ],
      functionName: 'reviewSubmission',
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

  async function onSubmit(data: SubmissionRevisionForm) {
    console.log('submit called')
    if (chain && chain.name !== 'Polygon Mumbai') {
      toast.error('Please switch chain before interacting with the protocol.')
      return
    }

    setIsApplicationLoading(true)

    const { description, judgment } = data

    const finalData = {
      judgment,
      description,
    }

    // eslint-disable-next-line no-unreachable
    let ipfsHashData
    try {
      const res = await formsUploadIPFS(finalData)
      console.log(res)
      ipfsHashData = res
    } catch (err) {
      console.log('ipfs error')
      toast.error('Error during the submission')
      console.log(err)
      setIsApplicationLoading(false)
      return
    }

    try {
      await handleCreateSubmissionRevision(
        taskMetadata.id,
        submissionMetadata.submissionId,
        ipfsHashData,
        judgment,
      )
      toast.success('Success!')
      push(`/task/${taskMetadata.id}`)
      setIsApplicationLoading(false)
    } catch (err) {
      toast.error('Error during the execution')
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
      console.log('search for the submission info on blockchain')
      console.log(id.id)
      getSubmission(id.id)
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

  if (address && taskMetadata && taskMetadata.executor !== address) {
    return (
      <div className="pb-[500px]">
        <div className="mt-[60px] flex items-center justify-center text-[#000000]">
          You are not allowed to review this submission
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
      {submissionMetadata && (
        <HeroSubmission
          submission={submissionMetadata}
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
                  Submit your revision
                </p>
                <p className="mt-[30px] max-w-[854px] text-[16px] font-medium !leading-[140%] text-[#505050]">
                  Be sure to submit a clear feedback, helping on the task's
                  development
                </p>
              </div>
              <div className="mt-[30px]">
                <p className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                  Feedback{' '}
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
                  Judgment
                  <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                    {errors.judgment?.message}
                  </p>
                </span>
                <Controller
                  name="judgment"
                  control={control}
                  rules={{ required: 'Judgment is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disabled={isLoading}
                      popupIcon={
                        <svg
                          width="16"
                          height="10"
                          viewBox="0 0 16 10"
                          className="mr-[15px] mt-[0px]"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                            fill="#959595"
                          />
                        </svg>
                      }
                      value={judgment}
                      onChange={(e, newValue) => {
                        field.onChange(newValue)
                        setJudgment(newValue)
                      }}
                      className="mt-[10px]"
                      options={judgmentOptions}
                      getOptionLabel={(option) => `${option}`}
                      sx={{
                        width: '500px',
                        fieldset: {
                          height: '45px',
                          borderColor: '#D4D4D4',
                          borderRadius: '10px',
                        },
                        input: { color: 'black' },
                      }}
                      size="small"
                      filterOptions={(options, state) =>
                        options.filter((option) =>
                          option
                            .toLowerCase()
                            .includes(state.inputValue.toLowerCase()),
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          variant="outlined"
                          id="margin-none"
                          sx={{
                            width: '500px',
                            fieldset: {
                              height: '45px',
                              borderColor: '#D4D4D4',
                              borderRadius: '10px',
                            },
                            input: { color: 'black', fontSize: '14px' },
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-[30px]">
              <button
                type="submit"
                className={`rounded-[10px] bg-[#0354EC] py-[12px] px-[25px] text-[18px] font-bold  text-white hover:bg-[#3c6cc5] ${
                  isApplicationLoading ? 'bg-[#5080da] hover:bg-[#5080da]' : ''
                }`}
                disabled={isApplicationLoading}
                onClick={handleSubmit(onSubmit)}
              >
                <span className="">Submit now</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default SubmissionRevision
