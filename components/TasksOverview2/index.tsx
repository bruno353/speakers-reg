/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import TasksModal from './TasksModal'
import SearchModal from './SearchModal'
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
} from '@/types/task'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import HeroTasks from './HeroTasks'
import { File, SmileySad, Info } from 'phosphor-react'

const TransactionList = () => {
  const [filteredTasks, setFilteredTasks] = useState<TasksOverview[]>([])
  const [departament, setDepartament] = useState('All')
  const [orderByDeadline, setOrderByDeadline] = useState('')
  const [orderByEstimatedBudget, setOrderByEstimatedBudget] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [finalTasks, setFinalTasks] = useState<TasksOverview[]>([])
  const [pagination, setPagination] = useState<TasksPagination>()
  const [counting, setCounting] = useState<TasksCounting>()
  const [taskMetadata, setTaskMetadata] = useState<IPFSSubmition[] | undefined>(
    [],
  )
  const [taskChainData, setTaskChainData] = useState<any[]>([])
  const pathname = usePathname()

  const statusOptions = ['open', 'active', 'completed', 'draft']
  const departamentsOptions = [
    'All',
    'Data',
    'Blockchain',
    'DevOps/Cloud',
    'Front-end',
  ]
  const orderByOptions = ['newest', 'oldest']
  const budgetOrderByOptions = ['greater', 'lesser']

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS

  const { push } = useRouter()

  const handleDepartamentSelection = (value: string) => {
    updateUrl('departament', value)
  }
  const handleOrderByDeadlineSelection = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('budgetOrderBy')
      window.history.pushState({}, '', url.toString())
    }
    if (orderByDeadline === 'oldest') {
      setOrderByDeadline('newest')
      updateUrl('orderBy', 'newest')
    } else {
      setOrderByDeadline('oldest')
      updateUrl('orderBy', 'oldest')
    }
  }

  const handleOrderByEstimatedBudgetSelection = () => {
    if (typeof window !== 'undefined') {
      console.log('window is undefined tn')
      const url = new URL(window.location.href)
      url.searchParams.delete('orderBy')
      window.history.pushState({}, '', url.toString())
    }
    if (orderByEstimatedBudget === 'greater') {
      setOrderByEstimatedBudget('lesser')
      updateUrl('budgetOrderBy', 'lesser')
    } else {
      setOrderByEstimatedBudget('greater')
      updateUrl('budgetOrderBy', 'greater')
    }
  }

  const handlePaginationSelectionNext = () => {
    updateUrl('page', String(pagination.currentPage + 1))
    scrollManually()
  }
  const handlePaginationSelectionPrev = () => {
    updateUrl('page', String(pagination.currentPage - 1))
    scrollManually()
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
        setOrderByDeadline(orderBy)
      }

      const budgetOrderBy = url.searchParams.get('budgetOrderBy')
      console.log(budgetOrderBy)
      if (budgetOrderBy && budgetOrderByOptions.includes(budgetOrderBy)) {
        dataBody['estimatedBudgetSorting'] = budgetOrderBy
        // cannot have two ordersby - so estimatedBudgetSorting has priority over deadlineSorting
        setOrderByDeadline('')
        setOrderByEstimatedBudget(budgetOrderBy)
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

    getTasks(dataBody)
  }

  async function getTasks(dataBody: any) {
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getTasks`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data: dataBody,
    }

    let dado
    try {
      await axios(config).then(function (response) {
        console.log('as respostas das taskss')
        console.log(response.data)
        if (response.data) {
          setFinalTasks(response.data.tasks)
          setPagination(response.data.pagination)
          setCounting(response.data.counting)
        }
      })
    } catch (err) {
      console.log('erro na setagem de tasks')
      console.log(err)
    }

    setIsLoading(false)
  }

  function NoTasks() {
    return (
      <div className="mt-[64px] mb-[100px] flex flex-col items-center">
        <SmileySad size={32} className="text-blue-500 mb-2" />
        <span>No tasks found</span>
      </div>
    )
  }

  useEffect(() => {
    console.log('useEffect chamado')
    handleUpdate()
  }, [pathname])

  return (
    <>
      <HeroTasks />
      <SearchModal
        onUpdate={handleUpdate}
        scrollManually={scrollManually}
        openProjectsNumber={counting ? counting.open : 0}
        activeProjectsNumber={counting ? counting.active : 0}
        completedProjectsNumber={counting ? counting.completed : 0}
        draftProjectsNumber={counting ? counting.draft : 0}
      />
      <section className="px-[100px] pt-[40px]" id={'taskStart'}>
        <div className="container px-0">
          <div className=" text-[#000000]">
            <div className="flex items-start justify-between rounded-[10px] border border-[#D4D4D4] bg-[#F1F0F0] px-[25px] py-[10px] text-[16px] font-bold">
              <div className="mr-4 flex w-[35%] items-center">
                <p
                  onClick={() => {
                    console.log('as tasks')
                    console.log(finalTasks)
                    console.log('filtered tasks')
                    console.log(filteredTasks)
                  }}
                  className="pr-2"
                >
                  Project
                </p>
              </div>
              <div className="flex w-[15%] items-center">
                <p className="pr-2">Dept/Tags</p>
              </div>
              <div className="flex w-[10%] items-center">
                <p className="pr-[15px]">Budget</p>
                {/* <img
                  src="/images/task/vectorDown.svg"
                  alt="image"
                  className={`w-[14px]`}
                /> */}
                <svg
                  onClick={handleOrderByEstimatedBudgetSelection}
                  className={`w-[14px] cursor-pointer  ${
                    orderByEstimatedBudget === 'greater'
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
              <div className="flex w-[8%] items-center">
                <p className="pr-[15px]">Ends</p>
                <svg
                  onClick={handleOrderByDeadlineSelection}
                  className={`w-[14px] cursor-pointer  ${
                    orderByDeadline === 'oldest' ? 'rotate-180 transform' : ''
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
              <div className="w-[12%]"></div>
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
            {!isLoading && finalTasks.length === 0 && <NoTasks />}
            {!isLoading &&
              finalTasks.length > 0 &&
              finalTasks.map((task, index) => (
                <TasksModal
                  key={task.id}
                  index={index}
                  task={task}
                  isLoading={false}
                />
              ))}
            {!isLoading && finalTasks.length > 0 && pagination && (
              <div className="flex items-center justify-center pt-16 pb-[100px] text-[18px] font-normal">
                {pagination.currentPage !== 1 && (
                  <p
                    onClick={handlePaginationSelectionPrev}
                    className="cursor-pointer hover:text-[#1068E6]"
                  >
                    Prev
                  </p>
                )}
                <p className="mx-14">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                {pagination.totalPages > pagination.currentPage && (
                  <p
                    onClick={handlePaginationSelectionNext}
                    className="cursor-pointer hover:text-[#1068E6]"
                  >
                    Next
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default TransactionList
