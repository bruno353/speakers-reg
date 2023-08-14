/* eslint-disable react/no-unescaped-entities */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
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
import {
  IPFSSubmition,
  TasksOverview,
  TasksPagination,
  TasksCounting,
  Application,
  Payment,
  Submission,
} from '@/types/task'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import { File, SmileySad, Info } from 'phosphor-react'

type ApplicantsSubmissionsListProps = {
  dataApplication: Application[]
  dataSubmission: Submission[]
  taskPayments: Payment[]
  taskDeadline: string
  taskProjectLength: string
  taskId: string
  budget: string
  status: string
  address: string
  taskExecutor: string
  contributorsAllowed: string[]
}

// eslint-disable-next-line prettier/prettier
const ApplicantsSubmissionsList = ({dataApplication, taskPayments, dataSubmission, taskDeadline, taskProjectLength, taskId, budget, address, taskExecutor, contributorsAllowed, status}: ApplicantsSubmissionsListProps) => {
  const [filteredTasks, setFilteredTasks] = useState<TasksOverview[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [departament, setDepartament] = useState('All')
  const [orderByTimestamp, setOrderByTimestamp] = useState('oldest')
  const [orderByBudget, setOrderByBudget] = useState('greater')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isNominationLoading, setIsNominationLoading] = useState<boolean>(false)
  const [isTakingTaskLoading, setIsTakingTaskLoading] = useState<boolean>(false)
  const [viewMoreSubmission, setViewMoreSubmission] = useState<any>()
  const [viewMoreApplication, setViewMoreApplication] = useState<any>()
  const [isDeadlineEnough, setIsDeadlineEnough] = useState<boolean>(true)

  const [finalTasks, setFinalTasks] = useState<TasksOverview[]>([])
  const [pagination, setPagination] = useState<TasksPagination>()
  const pathname = usePathname()

  const statusOptions = ['open', 'active', 'completed']
  const departamentsOptions = [
    'All',
    'Data',
    'Blockchain',
    'DevOps/Cloud',
    'Front-end',
  ]
  const orderByOptions = ['newest', 'oldest']

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS

  const { push } = useRouter()

  const handleDepartamentSelection = (value: string) => {
    updateUrl('departament', value)
  }
  const handleOrderByTimestampSelection = () => {
    let sortedApplications

    if (orderByTimestamp === 'oldest') {
      setOrderByTimestamp('newest')
      // do here the sorting to show the most recent timestamps first
      sortedApplications = [...applications].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      )
    } else {
      setOrderByTimestamp('oldest')
      // do here the sorting to show the oldest timestamps first
      sortedApplications = [...applications].sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp),
      )
    }

    setApplications(sortedApplications)
  }

  const handleOrderByBudgetSelection = () => {
    let sortedApplications

    if (orderByBudget === 'greater') {
      setOrderByBudget('lesser')
      // do here the sorting to show the cheaper budgets first
      sortedApplications = [...applications].sort(
        (a, b) =>
          Number(a.metadataProposedBudget) - Number(b.metadataProposedBudget),
      )
    } else {
      setOrderByBudget('greater')
      // do here the sorting to show the more expensive budgets first
      sortedApplications = [...applications].sort(
        (a, b) =>
          Number(b.metadataProposedBudget) - Number(a.metadataProposedBudget),
      )
    }

    setApplications(sortedApplications)
  }

  const handlePaginationSelectionNext = () => {
    updateUrl('page', String(pagination.currentPage + 1))
    scrollManually()
  }
  const handlePaginationSelectionPrev = () => {
    updateUrl('page', String(pagination.currentPage - 1))
    scrollManually()
  }

  function formatDeadline(timestamp) {
    const date = new Date(Number(timestamp) * 1000)
    let difference = formatDistanceToNow(date)

    // Aqui estamos tratando a frase para exibir 'today' se a task foi criada no mesmo dia
    difference = `${difference.charAt(0).toUpperCase()}${difference.slice(
      1,
    )} ago`
    return difference
  }

  // Função para atualizar a URL
  const updateUrl = (param: string, value: string | null) => {
    if (param !== 'page') {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('page')
        window.history.pushState({}, '', url.toString())
      }
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)

      if (value) {
        url.searchParams.set(param, value)
      } else {
        url.searchParams.delete(param)
      }

      window.history.pushState({}, '', url.toString())
      handleUpdate()
    }
  }

  function getStatusIndex(status: string): number {
    return statusOptions.indexOf(status)
  }

  // When I want to scroll manually to the tasks
  const scrollManually = () => {
    const taskStartElement = document.getElementById('taskStart')
    taskStartElement.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleCreateNomination(taskId: string, applicationId: string) {
    console.log('value to be sent')
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(taskId), [Number(applicationId)]],
      functionName: 'acceptApplications',
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

  async function handleCreateTakingTask(taskId: string, applicationId: string) {
    console.log('value to be sent')
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(taskId), [Number(applicationId)]],
      functionName: 'takeTask',
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

  async function handleNominate(applicationIdValue: string) {
    setIsNominationLoading(true)
    let hasToIncreaseBudget = false
    const amountToBeIncreased = []
    const newPaymentsAllowance = []

    console.log('reward')
    console.log(dataApplication[Number(applicationIdValue)].reward)
    console.log('reward test')
    console.log(
      Number(dataApplication[Number(applicationIdValue)].reward[0][2].hex),
    )
    console.log('payments')
    console.log(taskPayments)

    if (dataApplication[Number(applicationIdValue)].reward.length > 0) {
      console.log('reward exists')
      for (
        let i = 0;
        i < dataApplication[Number(applicationIdValue)].reward.length;
        i++
      ) {
        console.log('payment amount')
        console.log(taskPayments[i].amount)
        console.log('requested amount')
        console.log(
          Number(dataApplication[Number(applicationIdValue)].reward[i][2].hex),
        )
        if (
          Number(taskPayments[i].amount) <
          Number(dataApplication[Number(applicationIdValue)].reward[i][2].hex)
        ) {
          // eslint-disable-next-line prettier/prettier
          amountToBeIncreased.push(Number(dataApplication[Number(applicationIdValue)].reward[i][2].hex) -Number(taskPayments[i].amount),)
          hasToIncreaseBudget = true
          newPaymentsAllowance.push(taskPayments[i])
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
        toast.error('Something happened, please try again')
        setIsLoading(false)
        return
      }
      try {
        await handleIncreaseTaskBudget(taskId, amountToBeIncreased)
        toast.success('Budget increased succesfully!')
        setIsNominationLoading(false)
      } catch (err) {
        toast.error('Error during the budget increase')
        console.log(err)
        setIsNominationLoading(false)
      }
    }
    console.log('doing nomination')
    try {
      await handleCreateNomination(taskId, applicationIdValue)
      window.location.reload()
      toast.success('Nomination done succesfully!')
      setIsNominationLoading(false)
    } catch (err) {
      toast.error('Error during the application nomination')
      console.log(err)
      setIsNominationLoading(false)
    }
  }

  async function handleTakeTask(applicationIdValue: string) {
    setIsTakingTaskLoading(true)
    console.log('doing taking')
    try {
      await handleCreateTakingTask(taskId, applicationIdValue)
      window.location.reload()
      toast.success('Success!')
      setIsTakingTaskLoading(false)
    } catch (err) {
      toast.error('Error during the task taking')
      console.log(err)
      setIsTakingTaskLoading(false)
    }
  }

  const taskProjectLengthToDays = {
    'Less than 1 week': 5,
    '1 to 2 weeks': 14,
    '2 to 4 weeks': 30,
    'More than 4 weeks': 45,
  }

  // returns if the time to finish the task is equals or greater than the remaining days to the deadline
  async function getIfDeadlineIsEnough() {
    // Data atual em milissegundos
    const now = new Date().getTime()

    // Converte taskDeadline (que está em segundos) para milissegundos
    const deadline = Number(taskDeadline) * 1000

    // Calcula a diferença entre as duas datas em milissegundos
    const differenceInMilliseconds = deadline - now

    // Converte a diferença em dias (1000 milissegundos * 60 segundos * 60 minutos * 24 horas)
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24)

    console.log('the deadline')
    console.log(taskDeadline)
    console.log('the project length')
    console.log(taskProjectLengthToDays[taskProjectLength])
    console.log('difference in days')
    console.log(differenceInDays)

    // Retorna true se a diferença em dias for maior ou igual a taskProjectLength, senão false
    setIsDeadlineEnough(
      differenceInDays >= taskProjectLengthToDays[taskProjectLength],
    )
  }
  const handleUpdate = () => {
    console.log('updated url happening')
    setDepartament('All')

    let urlHasAllParamDepartament = false
    // setIsLoading(true)
    // the body that will be passed to call the getTasksFiltered() endpoint
    const dataBody = {}
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      console.log(`pegando os filtros pela window ${finalTasks}`)

      const status = url.searchParams.get('status')
      if (status) {
        // if it returns -1, it means that it was passed a value that is not in the array
        if (getStatusIndex(status) >= 0) {
          dataBody['status'] = String(getStatusIndex(status))
        }
      }

      const departament = url.searchParams.get('departament')
      if (
        departament &&
        departament !== 'All' &&
        departamentsOptions.includes(departament)
      ) {
        dataBody['departament'] = departament
        setDepartament(departament)
      }
      if (departament === 'All') {
        urlHasAllParamDepartament = true
      }

      const orderBy = url.searchParams.get('orderBy')
      console.log(orderBy)
      if (orderBy && orderByOptions.includes(orderBy)) {
        dataBody['deadlineSorting'] = orderBy
      }

      const searchBar = url.searchParams.get('searchBar')
      if (searchBar) {
        const searchPhrase = Array.isArray(searchBar) ? searchBar[0] : searchBar
        console.log('a search bar ' + searchPhrase)
        dataBody['searchBar'] = String(searchPhrase)
      }

      const pageNumber = url.searchParams.get('page')
      if (pageNumber && !isNaN(Number(pageNumber))) {
        dataBody['page'] = Number(pageNumber)
      }
    }

    if (Object.keys(dataBody).length !== 0 || urlHasAllParamDepartament) {
      const taskStartElement = document.getElementById('taskStart')
      taskStartElement.scrollIntoView({ behavior: 'smooth' })
    }

    // getTasks(dataBody)
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function formatName(address) {
    return `${address.slice(0, 12)}...`
  }

  function NoApplications() {
    return (
      <div className="mt-[64px] mb-[100px] flex flex-col items-center">
        <SmileySad size={32} className="text-blue-500 mb-2" />
        <span>No applications found</span>
      </div>
    )
  }

  function returnsBudget(percentage: string) {
    // eslint-disable-next-line prettier/prettier
    const amountRequested = Number((Number(budget) * Number(percentage) / 100).toFixed(2)).toLocaleString('en-US')

    return (
      <div className="font-bold !leading-[150%]">
        ${amountRequested}{' '}
        <span className="font-normal !leading-[150%]">({percentage}%)</span>
      </div>
    )
  }

  useEffect(() => {
    console.log('useEffect chamado')
    setApplications(dataApplication)
    setSubmissions(dataSubmission)
    console.log('recebi application')
    console.log(dataApplication)
    console.log('recebi submission')
    console.log(dataSubmission)
    getIfDeadlineIsEnough()
    handleUpdate()
  }, [dataApplication])

  return (
    <div className="text-[16px] font-medium !leading-[19px] text-[#505050]">
      {status === 'open' && isDeadlineEnough && (
        <div className="mt-[49px] w-full rounded-[10px] bg-[#F5F5F5] py-[30px] px-[15px]">
          <div className="flex justify-center">
            This project is still open for new applicants, if you are qualified
            candidate please apply now
          </div>
          <div className="flex justify-center">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`/application/${taskId}`}
              className="mt-[25px] flex h-[43px] w-[135px] cursor-pointer items-center justify-center rounded-[10px] bg-[#12AD50] px-[5px] text-[16px] font-bold text-white hover:bg-[#0b9040]"
            >
              Start working
            </a>
          </div>
        </div>
      )}
      {status === 'open' && !isDeadlineEnough && (
        <div className="mt-[49px] flex w-full rounded-[10px] bg-[#FFF6E0] py-[30px] px-[63px]">
          <div className="mr-[25px] mb-0 flex w-[35px] flex-none items-center">
            <img
              alt="warning"
              src="/images/task/warning.svg"
              className=""
            ></img>
          </div>
          <div className="!leading-[150%]">
            The project creator estimates that this project could take "
            {taskProjectLength}". The deadline for this project is approaching
            and it appears you may not be able to complete it on time. We
            recommend reaching out to the{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`/profile/${taskExecutor}`}
              className="mr-1 border-b border-[#0354EC] pl-1 text-[#0354EC]"
            >
              project creator{' '}
            </a>{' '}
            to request a time extension before proceeding.
          </div>
        </div>
      )}
      <div
        className={`text-[#000000] ${
          status === 'open' ? 'mt-[30px]' : 'mt-[49px]'
        }`}
      >
        <div className="flex items-center rounded-[10px] border border-[#D4D4D4] bg-[#F1F0F0] py-[11.5px] text-[16px] font-bold !leading-[150%]">
          <div className="mr-[52px] flex w-[400px] pl-[25px]">
            <p className="mr-[10px]">Applicants</p>
            <svg
              onClick={handleOrderByBudgetSelection}
              className={`w-[14px] cursor-pointer  ${
                orderByBudget === 'lesser' ? 'rotate-180 transform' : ''
              }`}
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                fill="#959595"
              />
            </svg>
          </div>
          <div className="mr-[52px] flex pl-[44px]">
            <p className="mr-[10px]">Budget</p>
            <svg
              onClick={handleOrderByBudgetSelection}
              className={`w-[14px] cursor-pointer  ${
                orderByBudget === 'lesser' ? 'rotate-180 transform' : ''
              }`}
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                fill="#959595"
              />
            </svg>
          </div>
          <div className="mr-[52px] flex">
            <p className="mr-[10px]">Job Success</p>
            <svg
              className={`w-[14px] cursor-pointer`}
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                fill="#959595"
              />
            </svg>
          </div>
          <div className="mr-[52px] flex pl-[29px]">
            <p className="mr-[10px]">Total Earned</p>
            <svg
              className={`w-[14px] cursor-pointer`}
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                fill="#959595"
              />
            </svg>
          </div>
          <div className="mr-[177px] flex pl-[47px]">
            <p className="mr-[10px]">Joined</p>
            <svg
              onClick={handleOrderByTimestampSelection}
              className={`w-[14px] cursor-pointer  ${
                orderByTimestamp === 'newest' ? 'rotate-180 transform' : ''
              }`}
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                fill="#959595"
              />
            </svg>
          </div>
        </div>
        {isLoading && (
          <div className="mt-[34px]">
            <div className="flex h-32 animate-pulse pb-12">
              <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
              <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
            </div>
            <div className="flex h-32 animate-pulse pb-12">
              <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
              <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
            </div>
            <div className="flex h-32 animate-pulse pb-12">
              <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
              <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
            </div>
          </div>
        )}
        {!isLoading && applications.length === 0 && <NoApplications />}
        {!isLoading &&
          applications.length > 0 &&
          applications.map((application, index) => (
            <div key={index}>
              <div
                className={`relative mr-1 ${
                  index === 0 ? 'mt-[34px]' : 'mt-[25px]'
                } flex items-start justify-between border-b border-[#D4D4D4] pb-6 text-[16px] font-normal text-[#000000]`}
              >
                <div className="mr-[52px] w-[400px] items-center">
                  <div className="flex">
                    <div>
                      <img
                        alt="ethereum avatar"
                        src={`https://effigy.im/a/${application.applicant}.svg`}
                        className="mr-[10px] w-[50px] rounded-full"
                      ></img>
                    </div>
                    <div>
                      <div className="flex">
                        <p
                          title={
                            application.metadataDisplayName ||
                            application.applicant
                          }
                          className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap pb-2 font-bold text-[#0354EC]"
                        >
                          {formatName(application.metadataDisplayName) ||
                            formatAddress(application.applicant)}
                        </p>
                        {application.accepted && (
                          <p
                            title={
                              application.metadataDisplayName ||
                              application.applicant
                            }
                            className="ml-[20px] max-w-[300px] pb-2 text-[14px] font-bold  text-[#12ad50]"
                          >
                            Approved
                          </p>
                        )}
                      </div>
                      <a
                        title={formatAddress(application.applicant)}
                        className="mt-[8px] cursor-pointer text-[14px] font-normal text-[#505050] hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://mumbai.polygonscan.com/address/${application.applicant}`}
                      >
                        {formatAddress(application.applicant)}
                      </a>
                    </div>
                  </div>
                  {viewMoreApplication &&
                  viewMoreApplication === application.applicationId ? (
                    <div
                      title={application.metadataDescription}
                      className="mt-[13px] max-h-[500px] overflow-y-auto text-[14px] font-normal !leading-[150%]"
                    >
                      {application.metadataDescription}
                    </div>
                  ) : (
                    <div
                      title={application.metadataDescription}
                      className="mt-[13px] text-[14px] font-normal !leading-[150%] line-clamp-2"
                    >
                      {application.metadataDescription}
                    </div>
                  )}
                </div>
                <div className="mr-[52px] flex w-[125px] items-center pl-[5px]">
                  <p className="max-w-[120%] overflow-hidden text-ellipsis whitespace-nowrap">
                    {returnsBudget(application.metadataProposedBudget)}
                  </p>
                </div>
                <div className="mr-[52px] flex w-[55px] items-center">
                  <p>{application.jobSuccess || 'Undefined'}</p>
                </div>
                <div className="mr-[52px] flex w-[55px] items-center">
                  <p>{application.jobSuccess || 'Undefined'}</p>
                </div>
                <div className="mr-[52px] flex w-[225px] items-center justify-center">
                  {formatDeadline(application.timestamp)}
                </div>

                <div>
                  {viewMoreApplication &&
                  viewMoreApplication === application.applicationId ? (
                    <div className="flex">
                      <a
                        // href={`/task/${task.id}`}
                        onClick={() => {
                          setViewMoreApplication(null)
                        }}
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px] border border-[#0354EC] bg-white py-[10px] text-[16px] font-normal text-[#0354EC] hover:bg-[#0354EC] hover:text-white"
                      >
                        View less
                      </a>
                    </div>
                  ) : (
                    <div className="flex">
                      <a
                        // href={`/task/${task.id}`}
                        onClick={() => {
                          setViewMoreApplication(application.applicationId)
                        }}
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px] border border-[#0354EC] bg-white py-[10px] text-[16px] font-normal text-[#0354EC] hover:bg-[#0354EC] hover:text-white"
                      >
                        View more
                      </a>
                    </div>
                  )}

                  {status === 'open' &&
                    !application.accepted &&
                    taskExecutor === address && (
                      <div className="mt-[11px] flex">
                        <a
                          // href={`/task/${task.id}`}
                          onClick={() => {
                            if (!isNominationLoading) {
                              handleNominate(application.applicationId)
                            }
                          }}
                          className={`ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px]   py-[10px] text-[16px] font-bold text-[#fff]  ${
                            isNominationLoading
                              ? 'bg-[#2f71ec]'
                              : 'bg-[#0354EC] hover:bg-[#092353]'
                          }`}
                        >
                          Nominate
                        </a>
                      </div>
                    )}
                  {status === 'open' &&
                    application.accepted &&
                    application.applicant === address && (
                      <div className="mt-[11px] flex">
                        <a
                          // href={`/task/${task.id}`}
                          onClick={() => {
                            if (!isTakingTaskLoading) {
                              handleTakeTask(application.applicationId)
                            }
                          }}
                          className={`ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px]   py-[10px] text-[16px] font-bold text-[#fff]  ${
                            isTakingTaskLoading
                              ? 'bg-[#2f71ec]'
                              : 'bg-[#0354EC] hover:bg-[#092353]'
                          }`}
                        >
                          Take task
                        </a>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>
      {!isLoading &&
        submissions.length > 0 &&
        submissions.map((submission, index) => (
          <div key={index} className={` text-[#000000]`}>
            {index === 0 && (
              <div className=" mt-[100px] flex items-center rounded-[10px] border border-[#D4D4D4] bg-[#F1F0F0] py-[11.5px] text-[16px] font-bold !leading-[150%]">
                <div className="mr-[52px] flex w-[400px] pl-[25px]">
                  <p className="mr-[10px]">Submissions</p>
                  <svg
                    onClick={handleOrderByBudgetSelection}
                    className={`w-[14px] cursor-pointer  ${
                      orderByBudget === 'lesser' ? 'rotate-180 transform' : ''
                    }`}
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                      fill="#959595"
                    />
                  </svg>
                </div>
                <div className="mr-[52px] flex w-[500px] pl-[44px]">
                  <p className="mr-[10px]">Links</p>
                  <svg
                    onClick={handleOrderByBudgetSelection}
                    className={`w-[14px] cursor-pointer  ${
                      orderByBudget === 'lesser' ? 'rotate-180 transform' : ''
                    }`}
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                      fill="#959595"
                    />
                  </svg>
                </div>
                <div className="mr-[177px] flex pl-[47px]">
                  <p className="mr-[10px]">Created</p>
                  <svg
                    onClick={handleOrderByTimestampSelection}
                    className={`w-[14px] cursor-pointer  ${
                      orderByTimestamp === 'newest'
                        ? 'rotate-180 transform'
                        : ''
                    }`}
                    viewBox="0 0 16 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84526 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                      fill="#959595"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div key={index}>
              <div
                className={`relative mr-1 ${
                  index === 0 ? 'mt-[34px]' : 'mt-[25px]'
                } flex items-start justify-between border-b border-[#D4D4D4] pb-6 text-[16px] font-normal text-[#000000]`}
              >
                <div className="mr-[52px] w-[400px] items-center">
                  <div className="flex">
                    <div>
                      <img
                        alt="ethereum avatar"
                        src={`https://effigy.im/a/${submission.applicant}.svg`}
                        className="mr-[10px] w-[50px] rounded-full"
                      ></img>
                    </div>
                    <div>
                      <div className="flex">
                        <p
                          title={submission.applicant}
                          className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap pb-2 font-bold text-[#0354EC]"
                        >
                          {formatAddress(submission.applicant)}
                        </p>
                        {submission.reviewed && submission.accepted && (
                          <p className="ml-[20px] max-w-[300px] pb-2 text-[14px] font-bold  text-[#12ad50]">
                            Accepted
                          </p>
                        )}
                        {submission.reviewed && !submission.accepted && (
                          <p className="ml-[20px] max-w-[300px] pb-2 text-[14px] font-bold  text-[#f90000]">
                            Rejected
                          </p>
                        )}
                      </div>
                      <a
                        title={formatAddress(submission.applicant)}
                        className="mt-[8px] cursor-pointer text-[14px] font-normal text-[#505050] hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://mumbai.polygonscan.com/address/${submission.applicant}`}
                      >
                        {formatAddress(submission.applicant)}
                      </a>
                    </div>
                  </div>
                  {viewMoreSubmission &&
                  viewMoreSubmission === submission.submissionId ? (
                    <div
                      title={submission.metadataDescription}
                      className="mt-[13px] max-h-[400px] overflow-y-auto text-[14px] font-normal !leading-[150%]"
                    >
                      {submission.metadataDescription}
                    </div>
                  ) : (
                    <div
                      title={submission.metadataDescription}
                      className="mt-[13px] text-[14px] font-normal !leading-[150%] line-clamp-2"
                    >
                      {submission.metadataDescription}
                    </div>
                  )}
                </div>
                {viewMoreSubmission &&
                viewMoreSubmission === submission.submissionId ? (
                  <div className="mr-[52px] flex w-[425px] items-center">
                    <p className="max-h-[400px] max-w-[220%] overflow-y-auto">
                      {submission.metadataAdditionalLinks}
                    </p>
                  </div>
                ) : (
                  <div className="mr-[52px] flex w-[425px] items-center">
                    <p className="max-w-[220%] overflow-hidden text-ellipsis whitespace-nowrap">
                      {submission.metadataAdditionalLinks}
                    </p>
                  </div>
                )}

                <div className="mr-[52px] flex w-[225px] items-center justify-center">
                  {formatDeadline(submission.timestamp)}
                </div>
                <div>
                  {viewMoreSubmission &&
                  viewMoreSubmission === submission.submissionId ? (
                    <div className="flex">
                      <a
                        // href={`/task/${task.id}`}
                        onClick={() => {
                          setViewMoreSubmission(null)
                        }}
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px] border border-[#0354EC] bg-white py-[10px] text-[16px] font-normal text-[#0354EC] hover:bg-[#0354EC] hover:text-white"
                      >
                        View less
                      </a>
                    </div>
                  ) : (
                    <div className="flex">
                      <a
                        // href={`/task/${task.id}`}
                        onClick={() => {
                          setViewMoreSubmission(submission.submissionId)
                        }}
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px] border border-[#0354EC] bg-white py-[10px] text-[16px] font-normal text-[#0354EC] hover:bg-[#0354EC] hover:text-white"
                      >
                        View more
                      </a>
                    </div>
                  )}

                  {status === 'active' &&
                    !submission.accepted &&
                    taskExecutor === address && (
                      <div className="mt-[11px] flex">
                        <a
                          href={`/review-submission/${submission.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`ml-auto flex w-[125px] cursor-pointer justify-center rounded-[5px] border border-[#0354EC] bg-white py-[10px] text-[16px] font-normal text-[#0354EC] hover:bg-[#0354EC] hover:text-white`}
                        >
                          Review
                        </a>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default ApplicantsSubmissionsList
