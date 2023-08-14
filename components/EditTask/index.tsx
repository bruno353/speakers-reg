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
import DOMPurify from 'dompurify'

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
import { Link, TasksOverview, Contributor } from '@/types/task'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HeroTask from '../TaskView/HeroTask'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type TaskApplicationForm = {
  description: string
}

type TaskSubmitForm = {
  title: string
  deadline: Date
  departament: string
  skills: string[]
  type: string
  projectLength: string
  numberOfApplicants: string
  githubLink: string
  calendarLink: string
  reachOutLink: string
  taskDraftDeadline: Date
}

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

type Payment = {
  tokenContract: string
  amount: string
}

type FileListProps = {
  files: File[]
  onRemove(index: number): void
}

const EditTask = (id: any) => {
  Decimal.set({ precision: 60 })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEditionLoading, setIsEditionLoading] = useState<boolean>(false)
  const [isApplicationLoading, setIsApplicationLoading] =
    useState<boolean>(false)
  const [ipfsHashTaskData, setIpfsHashTaskData] = useState<String>('')
  const [viewOption, setViewOption] = useState('projectDescription')
  const [taskChainData, setTaskChainData] = useState<any>()
  const [linksValues, setLinksValues] = useState([])
  const [taskMetadata, setTaskMetadata] = useState<TasksOverview>()
  const [budgetValue, setBudgetValue] = useState([100])
  const [budgetValueInputColor, setBudgetValueInputColor] =
    useState<String>('#009A50')
  const [estimatedBudgetRequested, setEstimatedBudgetRequested] =
    useState<String>('')
  const [contributorsAllowed, setContributorsAllowed] = useState([])
  const [budgetPercentage, setBudgetPercentage] = useState(100)
  const [howLikelyToMeetTheDeadlineValue, setHowLikelyToMeetTheDeadlineValue] =
    useState('')
  const [currentlyDeadline, setCurrentlyDeadline] = useState<Date>()
  const [fundingView, setFundingView] = useState<boolean>(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [currentlyPayments, setCurrentlyPayments] = useState<Payment[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [departamentOptionsToAddress, setDepartamentOptionsToAddress] =
    useState({})
  const [departamentOptions, setDepartamentOptions] = useState([])
  const [editorHtml, setEditorHtml] = useState('')
  const [projectLength, setProjectLength] = useState('')
  const [numberOfApplicants, setNumberOfApplicants] = useState('')
  const [departament, setDepartament] = useState('')

  const [links, setLinks] = useState<Link[]>([
    { title: 'githubLink', url: '' },
    { title: 'calendarLink', url: '' },
    { title: 'reachOutLink', url: '' },
  ])

  const projectLengthOptions = [
    'Less than 1 week',
    '1 to 2 weeks',
    '2 to 4 weeks',
    'More than 4 weeks',
  ]

  const numberOfApplicantsOptions = ['1', '2', '3', '4', '5']

  const skillOptions = [
    'Backend',
    'Frontend',
    'Web development',
    'Solidity',
    'UI',
    'UX',
    'HR',
  ]

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
  function handleChange(value) {
    if (editorHtml.length < 5000) {
      setEditorHtml(value)
    }

    console.log('the value markdown')
    console.log(value)
  }

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

  const addPayments = () => {
    if (payments.length > 4) {
      toast.error('Only 5 payments per task', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return
    }
    setPayments([
      ...payments,
      {
        tokenContract: '',
        amount: '',
      },
    ])
  }

  const addContributors = () => {
    if (contributors.length > 15) {
      toast.error('Maximum of 15', {
        position: toast.POSITION.TOP_RIGHT,
      })
      return
    }
    setContributors([
      ...contributors,
      {
        walletAddress: '',
        budgetPercentage: 0,
      },
    ])
  }

  const handleDeletePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const handleDeleteContributors = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index))
  }

  const handleBudgetPercentage = (
    index: number,
    field: keyof Contributor,
    valueReceived: string,
  ) => {
    const newContributors = [...contributors]

    if (
      Number(newContributors[index][field]) &&
      Number(newContributors[index][field]) >= 100
    ) {
      return
    }

    const value = valueReceived.replace(/[^0-9]/g, '')

    newContributors[index]['budgetPercentage'] = Number(value)
    setContributors(newContributors)
  }

  const handleAmountPayment = (
    index: number,
    field: keyof Payment,
    valueReceived: string,
  ) => {
    console.log('os currently payments')
    console.log(currentlyPayments)
    console.log('os currently data')
    const newPayment = [...payments]

    if (
      newPayment[index][field].length > 10000000000000000000000000000000000000
    ) {
      return
    }

    const value = valueReceived.replace(/[^0-9]/g, '')

    if (Number(value) < Number(currentlyPayments[index][field])) {
      return
    }

    newPayment[index][field] = value
    setPayments(newPayment)
  }

  const handleERC20AddressPayment = (
    index: number,
    field: keyof Payment,
    valueReceived: string,
  ) => {
    const newPagamentos = [...payments]

    if (newPagamentos[index][field].length > 100) {
      return
    }

    const value = valueReceived

    newPagamentos[index][field] = value
    setPayments(newPagamentos)
  }

  const validSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    deadline: Yup.date()
      .transform((value, originalValue) => {
        return originalValue ? new Date(originalValue) : null
      })
      .typeError('Deadline is required')
      .required('Deadline is required'),
    taskDraftDeadline: Yup.date()
      .transform((value, originalValue) => {
        return originalValue ? new Date(originalValue) : null
      })
      .optional(),
    departament: Yup.string().required('Department is required'),
    skills: Yup.array()
      .of(Yup.string())
      .min(2, 'At least two tags are required')
      .max(3, 'You can select up to 3 skills'),
    projectLength: Yup.string().required('Project length is required'),
    numberOfApplicants: Yup.string().required(
      'Number of applicants is required',
    ),
    githubLink: Yup.string().notRequired(),
    calendarLink: Yup.string().notRequired(),
    reachOutLink: Yup.string().notRequired(),
    type: Yup.string().notRequired(),
  })
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<TaskSubmitForm>({
    resolver: yupResolver(validSchema),
  })

  async function getDepartaments() {
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getDepartaments`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
    }

    try {
      // [		{			"id": "1b71121d-be7c-4331-89e9-5a6e6312852b",			"name": "Blockchain",			"addressTaskDrafts": "0x8c10bC4673d4f0B46cb565Bb565A5054368BC0E4",			"addressDAO": "0x11dF7E88E2FE64c5f7656c1311609Cc838D544DF",			"addressTokenListGovernance": "0x2cda520aAD302836b3110F20B48163f96869383B",			"createdAt": "2023-08-07T06:10:39.000Z",			"updatedAt": "2023-08-07T06:09:55.000Z"		},		{			"id": "1b71122d-be8c-4331-89e9-5a6e6312852b",			"name": "Cloud",			"addressTaskDrafts": "0x68Aaa9f0b989214C4a20831234A2b65F89e6846f",			"addressDAO": "0x7b92f0E65cCAeF6F8e259ABcFD5C87E3f0969Ddc",			"addressTokenListGovernance": "0xE80bC76b61C39f9DD012541d972A39AaC9CBCFAe",			"createdAt": "2023-08-08T11:43:06.000Z",			"updatedAt": null		},		{			"id": "9addf5fb-5ab8-4d80-b0bf-e26247920bd4",			"name": "Frontend",			"addressTaskDrafts": "0xbD6CdE02D09f0a59e9E83f38EbA47c60Fa402921",			"addressDAO": "0x8c8C9331c0550C3Dc492f6A11fC9b891F3AbFe62",			"addressTokenListGovernance": "0x8248db7F95ec6CA2818A73E7CA95de1c0CC77310",			"createdAt": "2023-08-10T14:15:06.000Z",			"updatedAt": null		},		{			"id": "f069bf45-f8b7-4e57-97d1-14bdcaf4bc17",			"name": "Data",			"addressTaskDrafts": "0x104D58217F1184548fEeC388640e9a6aD38C35c1",			"addressDAO": "0x10C93ee6962edfCE77f1ad1f04E86235e2bf96d2",			"addressTokenListGovernance": "0xdbf68eF0876A96A9A13D6D82279aAF2228E1fF9E",			"createdAt": "2023-08-10T14:12:57.000Z",			"updatedAt": null		}	]
      await axios(config).then(function (response) {
        if (response.data && response.data.departaments.length > 0) {
          const departamentsNameList = []
          const departamentsToAddress = {}

          response.data.departaments.forEach((departament) => {
            departamentsNameList.push(departament.name)
            departamentsToAddress[departament.name] =
              departament.addressTokenListGovernance
          })

          setDepartamentOptionsToAddress(departamentsToAddress)
          setDepartamentOptions(departamentsNameList)
        }
      })
    } catch (err) {
      toast.error('Error getting the departaments options!')
      console.log(err)
    }
    setIsLoading(false)
  }

  async function getTask(taskId: string) {
    console.log('get task chamado')
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
          // setting pre-defined values
          setValue('title', response.data.title)
          setValue('departament', response.data.departament)
          setDepartament(response.data.departament)
          const cleanHtml = DOMPurify.sanitize(response.data.description)
          setEditorHtml(cleanHtml)
          setProjectLength(response.data.projectLength)
          setValue('projectLength', response.data.projectLength)
          setValue('skills', response.data.skills)
          setValue('numberOfApplicants', response.data.contributorsNeeded)
          setValue('githubLink', response.data.links[0]['url'])
          setValue('calendarLink', response.data.links[1]['url'])
          setValue('reachOutLink', response.data.links[2]['url'])
          setNumberOfApplicants(response.data.contributorsNeeded)
          setValue('deadline', new Date(response.data.deadline * 1000))
          setCurrentlyDeadline(new Date(response.data.deadline * 1000))
          setPayments(response.data.payments)
          // Cria uma cópia profunda usando JSON -- currentlyPayments estava mudando conforme mudávamos o response.data.payments, entao criamos uma copai
          setCurrentlyPayments(
            JSON.parse(JSON.stringify(response.data.payments)),
          )
          console.log('os currently payments')
          console.log(response.data.payments)
          console.log(currentlyPayments)
          setBudgetValue([response.data.estimatedBudget])
          // Treating payments
          // const payments = response.data.payments.map((payment) => {
          //   const amountInNumber = Number(payment.amount)
          //   return {
          //     to: address,
          //     amount: amountInNumber,
          //     nextToken: true,
          //   }
          // })
          setPayments(response.data.payments)

          // Removendo o campo 'decimals'
          // payments.forEach((payment) => {
          //   delete payment.decimals
          // })

          if (response.data['Application']) {
            const contributors = response.data['Application']
              .filter((app) => app.taken === true)
              .map((app) => app.applicant)

            setContributorsAllowed(contributors)
          }

          // setPayments(payments)
          setIsLoading(false)
        }
      })
    } catch (err) {
      toast.error('Task not found!')
      setIsLoading(false)
    }
  }

  const handleWalletAddressContributor = (
    index: number,
    field: keyof Contributor,
    valueReceived: string,
  ) => {
    const newContributors = [...contributors]

    if (newContributors[index]['walletAddress'].length > 100) {
      return
    }

    const value = valueReceived

    newContributors[index]['walletAddress'] = value
    setContributors(newContributors)
  }

  const handleDateChange = (onChange) => (date) => {
    if (date < currentlyDeadline) {
      toast.error('The deadline cannot be decreased', {
        position: toast.POSITION.TOP_RIGHT,
      })
    } else {
      onChange(date)
    }
  }

  async function onSubmit(data: TaskSubmitForm) {
    console.log('submit initiate')
    if (chain && chain.name !== 'Polygon Mumbai') {
      toast.error('Please switch chain before interacting with the protocol.')
      return
    }
    if (!editorHtml || editorHtml.length === 0) {
      toast.error('Please set a description.')
      const element = document.getElementById('descId')
      element.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (payments.length === 0) {
      toast.error('Please set a payment.')
      const element = document.getElementById('budgetId')
      element.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (contributors.length > 0) {
      let totalSumBudgetPercentage = 0
      for (let i = 0; i < contributors.length; i++) {
        totalSumBudgetPercentage += contributors[i].budgetPercentage
      }
      if (totalSumBudgetPercentage !== 100) {
        toast.error('Total sum of budget percentage needs to be 100.')
        const element = document.getElementById('contributorsId')
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    setIsEditionLoading(true)
    // First, checking if deadline and/or budget had any changes, if so its needed to called its respective functions on smart-contract to change it, besides of justing changing the metadata description
    console.log('changing the deadline')
    try {
      await checkDeadline(currentlyDeadline, data.deadline)
    } catch (err) {
      toast.error('Error during the deadline change')
      return
    }

    console.log('changing the budget')
    try {
      await checkBudget(currentlyPayments, payments)
    } catch (err) {
      toast.error('Error during the budget change')
      return
    }

    // after checking budget and deadline, change the metadata
    const finalData = {
      ...data,
      projectLength,
      numberOfApplicants,
      description: editorHtml,
      contributors,
      payments,
      links,
      file: '',
    }

    console.log('changing the ipfs')
    let ipfsHashData
    try {
      const res = await formsUploadIPFS(finalData)
      console.log('a resposta:')
      console.log(res)
      ipfsHashData = res
      setIpfsHashTaskData(res)
    } catch (err) {
      toast.error('something ocurred')
      console.log(err)
      setIsEditionLoading(false)
      return
    }

    console.log('changing the task creation')
    try {
      await handleEditMetadata(Number(id.id), ipfsHashData)
      await new Promise((resolve) => setTimeout(resolve, 11500))
      toast.success('Task edited succesfully!')
      push(`/task/${id.id}`)
    } catch (err) {
      toast.error('Error metadata change')
      console.log(err)
      setIsEditionLoading(false)
      return
    }
    setIsEditionLoading(false)
  }

  async function handleEditMetadata(taskId: number, metadata: string) {
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [taskId, metadata],
      functionName: 'editMetadata',
    })
    const { hash } = await writeContract(request)
    // const unwatch = watchContractEvent(
    //   {
    //     address: `0x${taskAddress.substring(2)}`,
    //     abi: taskContractABI,
    //     eventName: 'TaskCreated',
    //   },
    //   (log) => {
    //     console.log('event')
    //     console.log(log)
    //     if (log[0].transactionHash === hash) {
    //       push(`/task/${Number(log[0]['args']['taskId'])}`)
    //       console.log(log)
    //     }
    //   },
    // )
    const data = await waitForTransaction({
      hash,
    })
    console.log('the data')
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    if (data.status !== 'success') {
      throw data
    }
  }

  async function checkDeadline(currentlyDeadline: Date, newDeadline: Date) {
    const difference =
      Math.floor(newDeadline.getTime() / 1000) -
      Math.floor(currentlyDeadline.getTime() / 1000)

    if (currentlyDeadline !== newDeadline && difference > 0) {
      const { request } = await prepareWriteContract({
        address: `0x${taskAddress.substring(2)}`,
        abi: taskContractABI,
        args: [Number(id.id), difference],
        functionName: 'extendDeadline',
      })
      const { hash } = await writeContract(request)
      // const unwatch = watchContractEvent(
      //   {
      //     address: `0x${taskAddress.substring(2)}`,
      //     abi: taskContractABI,
      //     eventName: 'TaskCreated',
      //   },
      //   (log) => {
      //     console.log('event')
      //     console.log(log)
      //     if (log[0].transactionHash === hash) {
      //       push(`/task/${Number(log[0]['args']['taskId'])}`)
      //       console.log(log)
      //     }
      //   },
      // )
      const data = await waitForTransaction({
        hash,
      })
      console.log('the data')
      console.log(data)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      if (data.status !== 'success') {
        throw data
      }
    }
  }

  async function formsUploadIPFS(data: any) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/uploadIPFSMetadataTaskCreation`,
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

  async function checkBudget(currentlyBudget: Payment[], newBudget: Payment[]) {
    let hasToIncreaseBudget = false
    const amountToBeIncreased = []
    const newPaymentsAllowance = []

    if (newBudget.length > 0) {
      console.log('reward exists')
      for (let i = 0; i < newBudget.length; i++) {
        console.log('payment amount')
        console.log(newBudget[i].amount)
        console.log('requested amount')
        console.log(Number(currentlyBudget[i].amount))
        if (Number(newBudget[i].amount) > Number(currentlyBudget[i].amount)) {
          // eslint-disable-next-line prettier/prettier
          amountToBeIncreased.push(Number(newBudget[i].amount) - Number(currentlyBudget[i].amount))
          hasToIncreaseBudget = true
          newPaymentsAllowance.push(newBudget[i])
        } else {
          amountToBeIncreased.push(0)
        }
      }
    }
    console.log('final result')
    console.log(hasToIncreaseBudget)
    if (hasToIncreaseBudget) {
      try {
        await handleAllowanceFromTokens(newPaymentsAllowance)
      } catch (err) {
        toast.error('Error during the budget increase')
        setIsLoading(false)
        console.log(err)
        throw err
      }
      try {
        await handleIncreaseTaskBudget(id.id, amountToBeIncreased)
      } catch (err) {
        toast.error('Error during the budget increase')
        console.log(err)
        throw err
      }
    }
  }

  async function handleIncreaseTaskBudget(taskId: string, amounts: number[]) {
    console.log('value to be sent')
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(taskId), amounts],
      functionName: 'increaseBudget',
    })
    const { hash } = await writeContract(request)

    const data = await waitForTransaction({
      hash,
    })
    console.log('the data')
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (data.status !== 'success') {
      throw data
    }
  }

  async function handleAllowanceFromTokens(payments) {
    for (let i = 0; i < payments.length; i++) {
      const data = await readContract({
        address: `0x${payments[i].tokenContract.substring(2)}`,
        abi: erc20ContractABI,
        args: [address, `0x${taskAddress.substring(2)}`],
        functionName: 'allowance',
      })
      console.log('o valor q recebi')
      console.log(data)
      if (Number(data) < Number(payments[i].amount)) {
        console.log('required to increase allowance')
        const { request } = await prepareWriteContract({
          address: `0x${payments[i].tokenContract.substring(2)}`,
          abi: erc20ContractABI,
          args: [
            `0x${taskAddress.substring(2)}`,
            Number(payments[i].amount) * 100,
          ],
          functionName: 'approve',
        })
        const { hash } = await writeContract(request)
        const data = await waitForTransaction({
          hash,
        })
        console.log('the data')
        console.log(data)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (data.status !== 'success') {
          throw data
        }
      }
    }
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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

  if (taskMetadata && address !== taskMetadata.executor) {
    return (
      <div className="pb-[500px]">
        <div className="mt-[60px] flex items-center justify-center text-[#000000]">
          You are not allowed to edit to this task
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
          address={null}
        />
      )}
      <section className="mt-12 mb-24  px-32 text-[14px] font-medium !leading-[17px]  text-[#000000]">
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="">
              <div>
                <div className="">
                  <div className="">
                    <span className="flex flex-row">
                      Project Title
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.title?.message}
                      </p>
                    </span>
                    <input
                      disabled={isEditionLoading}
                      className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                      type="text"
                      maxLength={100}
                      placeholder=""
                      {...register('title')}
                    />
                  </div>
                  <div className="mt-[30px]">
                    <span className="flex flex-row">
                      Tag the project for easier discovery
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.skills?.message}
                      </p>
                    </span>
                    <Controller
                      name="skills"
                      control={control}
                      defaultValue={[]}
                      rules={{
                        required: 'At least two tags are required',
                        validate: (value) =>
                          value.length >= 2 || 'At least two tags are required',
                      }}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          multiple
                          popupIcon={
                            <svg
                              width="16"
                              height="10"
                              viewBox="0 0 16 10"
                              className="mr-[15px] mt-[13px]"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                                fill="#959595"
                              />
                            </svg>
                          }
                          disabled={isEditionLoading}
                          className="mt-[10px]"
                          options={skillOptions}
                          size="small"
                          getOptionLabel={(option) => `${option}`}
                          filterOptions={(options, state) =>
                            options.filter((option) =>
                              option
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase()),
                            )
                          }
                          onChange={(e, newValue) => {
                            if (newValue.length <= 8) {
                              field.onChange(newValue)
                            } else {
                              console.log('not aloweed')
                              toast.error('Only 8 tags per task', {
                                position: toast.POSITION.TOP_RIGHT,
                              })
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              id="margin-none"
                              sx={{
                                width: '500px',
                                fieldset: {
                                  height: '55px',
                                  borderColor: '#D4D4D4',
                                  borderRadius: '10px',
                                },
                                input: { color: 'black' },
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-[30px]">
                    <span className="flex flex-row">
                      Project length
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.projectLength?.message}
                      </p>
                    </span>
                    <Controller
                      name="projectLength"
                      control={control}
                      rules={{ required: 'Project length is required' }}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          disabled={isEditionLoading}
                          popupIcon={
                            <svg
                              width="16"
                              height="10"
                              viewBox="0 0 16 10"
                              className="mr-[15px] mt-[13px]"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                                fill="#959595"
                              />
                            </svg>
                          }
                          value={projectLength}
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                            setProjectLength(newValue)
                          }}
                          className="mt-[10px]"
                          options={projectLengthOptions}
                          getOptionLabel={(option) => `${option}`}
                          sx={{
                            width: '500px',
                            fieldset: {
                              height: '55px',
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
                                  height: '55px',
                                  borderColor: '#D4D4D4',
                                  borderRadius: '10px',
                                },
                                input: { color: 'black' },
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-[30px]" id="budgetId">
                    <span className="flex flex-row">
                      Deadline
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.deadline?.message}
                      </p>
                    </span>
                    <Controller
                      control={control}
                      name="deadline"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <DatePicker
                          onChange={handleDateChange(onChange)}
                          onBlur={onBlur}
                          selected={value}
                          dateFormat="yyyy-MM-dd"
                          disabled={isEditionLoading}
                          className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                        />
                      )}
                    />
                  </div>
                  <div className="mt-[30px] max-h-[500px] overflow-auto">
                    <span className="flex flex-row">Budget</span>
                    {payments.map((pagamento, index) => (
                      <div key={index} className="payment mb-2">
                        <div className="mb-1 mt-4 flex items-center text-sm font-medium">
                          <h3>Payment {index + 1}</h3>
                          {/* {index === payments.length - 1 && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleDeletePayment(index)}
                              className="ml-2 font-extrabold text-[#707070]"
                            >
                              X
                            </button>
                          )} */}
                        </div>
                        <div className="flex justify-start">
                          <div className="">
                            <label
                              htmlFor={`payment-${index}-erc20Address`}
                              className="mb-1 block text-xs"
                            >
                              ERC20 Token
                            </label>
                            <input
                              type="text"
                              disabled={true}
                              id={`payment-${index}-erc20Address`}
                              value={pagamento.tokenContract}
                              onChange={(e) =>
                                handleERC20AddressPayment(
                                  index,
                                  'tokenContract',
                                  e.target.value,
                                )
                              }
                              className="mt-[8px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                            />
                          </div>
                          <div className="ml-2">
                            <label
                              htmlFor={`payment-${index}-amount`}
                              className="mb-1 block text-xs"
                            >
                              Amount (with decimal places)
                            </label>
                            <input
                              type="text"
                              disabled={isEditionLoading}
                              id={`payment-${index}-amount`}
                              value={pagamento.amount}
                              onChange={(e) =>
                                handleAmountPayment(
                                  index,
                                  'amount',
                                  e.target.value,
                                )
                              }
                              className="mt-[8px] mr-[15px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                            />
                          </div>
                          {/* {index === payments.length - 1 && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={addPayments}
                              className="mt-[28px] h-[50px] w-[129px] rounded-[10px] border border-[#D4D4D4] bg-white px-2 text-[14px]  font-normal text-[#D4D4D4] hover:text-[#b6b5b5]"
                            >
                              + Add more
                            </button>
                          )} */}
                        </div>
                      </div>
                    ))}
                    {/* {(!payments || payments.length === 0) && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={addPayments}
                        className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-2 text-[14px]  font-normal text-[#D4D4D4] hover:text-[#b6b5b5]"
                      >
                        + Add payment
                      </button>
                    )} */}
                  </div>
                  <div className="mt-[30px]" id="contributorsId">
                    <span className="flex flex-row">
                      Number of applicants/contributors needed
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                        {errors.numberOfApplicants?.message}
                      </p>
                    </span>
                    <Controller
                      name="numberOfApplicants"
                      control={control}
                      rules={{ required: 'Number of applicants is required' }}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          disabled={isEditionLoading}
                          value={numberOfApplicants}
                          popupIcon={
                            <svg
                              width="16"
                              height="10"
                              viewBox="0 0 16 10"
                              className="mr-[15px] mt-[13px]"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                                fill="#959595"
                              />
                            </svg>
                          }
                          onChange={(e, newValue) => {
                            field.onChange(newValue)
                            setNumberOfApplicants(newValue)
                          }}
                          className="mt-[10px]"
                          options={numberOfApplicantsOptions}
                          getOptionLabel={(option) => `${option}`}
                          sx={{
                            width: '500px',
                            fieldset: {
                              height: '55px',
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
                                  height: '55px',
                                  borderColor: '#D4D4D4',
                                  borderRadius: '10px',
                                },
                                input: { color: 'black' },
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </div>

                  <div className="mt-[30px] max-h-[500px]  overflow-auto">
                    <span className="flex flex-row">
                      Add contributors (optional)
                    </span>
                    {contributors.map((contributor, index) => (
                      <div key={index} className="payment mb-2">
                        <div className="mb-1 mt-4 flex items-center text-sm font-medium">
                          <h3>Contributor {index + 1}</h3>
                          {index === contributors.length - 1 && (
                            <button
                              type="button"
                              disabled={isEditionLoading}
                              onClick={() => handleDeleteContributors(index)}
                              className="ml-2 font-extrabold text-[#707070]"
                            >
                              X
                            </button>
                          )}
                        </div>
                        <div className="flex justify-start">
                          <div className="">
                            <label
                              htmlFor={`contributor-${index}-walletAddress`}
                              className="mb-1 block text-xs"
                            >
                              Wallet address
                            </label>
                            <input
                              type="text"
                              disabled={isEditionLoading}
                              id={`contributor-${index}-walletAddress`}
                              value={contributor.walletAddress}
                              onChange={(e) =>
                                handleWalletAddressContributor(
                                  index,
                                  'walletAddress',
                                  e.target.value,
                                )
                              }
                              className="mt-[8px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                            />
                          </div>
                          <div className="ml-2">
                            <label
                              htmlFor={`payment-${index}-amount`}
                              className="mb-1 block text-xs"
                            >
                              Budget %
                            </label>
                            <input
                              type="text"
                              disabled={isEditionLoading}
                              id={`payment-${index}-amount`}
                              value={contributor.budgetPercentage}
                              onChange={(e) =>
                                handleBudgetPercentage(
                                  index,
                                  'budgetPercentage',
                                  e.target.value,
                                )
                              }
                              className="mt-[8px] mr-[15px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                            />
                          </div>
                          {index === contributors.length - 1 && (
                            <button
                              type="button"
                              disabled={isEditionLoading}
                              onClick={addContributors}
                              className="mt-[28px] h-[50px] w-[129px] rounded-[10px] border border-[#D4D4D4] bg-white px-2 text-[14px]  font-normal text-[#D4D4D4] hover:text-[#b6b5b5]"
                            >
                              + Add more
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!contributors || contributors.length === 0) && (
                      <button
                        type="button"
                        disabled={isEditionLoading}
                        onClick={addContributors}
                        className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-2 text-[14px]  font-normal text-[#D4D4D4] hover:text-[#b6b5b5]"
                      >
                        + Add contributor
                      </button>
                    )}
                  </div>
                  <div className="mt-[30px]" id="descId">
                    <span className="flex flex-row">
                      Project Description (full)
                      <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] "></p>
                    </span>
                    <QuillNoSSRWrapper
                      value={editorHtml}
                      onChange={handleChange}
                      // disabled={isLoading}
                      className="mt-2 min-h-[300px] w-[900px] rounded-md border border-[#D4D4D4] bg-white text-base font-normal outline-0"
                      // maxLength={5000}
                      placeholder="Type here"
                    />
                  </div>
                </div>
                <div className="mt-[30px]">
                  <span className="flex flex-row">
                    Departament
                    <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                      {errors.departament?.message}
                    </p>
                  </span>
                  <Controller
                    name="departament"
                    control={control}
                    rules={{ required: 'Department is required' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        disabled={true}
                        popupIcon={
                          <svg
                            width="16"
                            height="10"
                            viewBox="0 0 16 10"
                            className="mr-[15px] mt-[13px]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                              fill="#959595"
                            />
                          </svg>
                        }
                        value={departament}
                        onChange={(e, newValue) => {
                          field.onChange(newValue)
                          setDepartament(newValue)
                        }}
                        className="mt-[10px]"
                        options={departamentOptions}
                        getOptionLabel={(option) => `${option}`}
                        sx={{
                          width: '500px',
                          fieldset: {
                            height: '55px',
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
                                height: '55px',
                                borderColor: '#D4D4D4',
                                borderRadius: '10px',
                              },
                              input: { color: 'black' },
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </div>
                <div className="mt-[50px]">
                  <span className="flex flex-row">
                    Github Repository Link (optional)
                    <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                      {errors.githubLink?.message}
                    </p>
                  </span>
                  <input
                    type="text"
                    disabled={isEditionLoading}
                    maxLength={200}
                    {...register('githubLink')}
                    onChange={(e) => handleLink(0, 'url', e.target.value)}
                    className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                  />
                </div>
                <div className="mt-[30px]">
                  <span className="flex flex-row">
                    Calendar Link (optional)
                    <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                      {errors.calendarLink?.message}
                    </p>
                  </span>
                  <input
                    type="text"
                    disabled={isEditionLoading}
                    maxLength={200}
                    {...register('calendarLink')}
                    onChange={(e) => handleLink(1, 'url', e.target.value)}
                    className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                  />
                </div>
                <div className="mt-[30px]">
                  <span className="flex flex-row">
                    Reach out Link (optional)
                    <p className="ml-[8px] text-[10px] font-normal text-[#ff0000] ">
                      {errors.reachOutLink?.message}
                    </p>
                  </span>
                  <input
                    type="text"
                    disabled={isEditionLoading}
                    maxLength={200}
                    {...register('reachOutLink')}
                    onChange={(e) => handleLink(2, 'url', e.target.value)}
                    className="mt-[10px] h-[50px] w-[500px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0"
                  />
                </div>
              </div>
            </div>
            {isEditionLoading ? (
              <div className="mt-[30px] flex pb-60">
                <button
                  disabled={true}
                  className=" mr-[15px] h-[50px] w-[250px] rounded-[10px] bg-[#53c781] py-[12px] px-[25px] text-[16px] font-bold  text-white hover:bg-[#53c781]"
                  onClick={handleSubmit(onSubmit)}
                >
                  <span className="">Edit task</span>
                </button>
                <svg
                  className="mt-1 animate-spin"
                  height="40px"
                  id="Icons"
                  version="1.1"
                  viewBox="0 0 80 80"
                  width="40px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M58.385,34.343V21.615L53.77,26.23C50.244,22.694,45.377,20.5,40,20.5c-10.752,0-19.5,8.748-19.5,19.5S29.248,59.5,40,59.5  c7.205,0,13.496-3.939,16.871-9.767l-4.326-2.496C50.035,51.571,45.358,54.5,40,54.5c-7.995,0-14.5-6.505-14.5-14.5  S32.005,25.5,40,25.5c3.998,0,7.617,1.632,10.239,4.261l-4.583,4.583H58.385z" />
                </svg>
              </div>
            ) : (
              <div className="mt-[30px] pb-60">
                <button
                  type="submit"
                  className=" h-[50px] w-[250px] rounded-[10px] bg-[#12AD50] py-[12px] px-[25px] text-[16px] font-bold  text-white hover:bg-[#0e7a39]"
                  onClick={handleSubmit(onSubmit)}
                >
                  <span className="">Edit task</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  )
}

export default EditTask
