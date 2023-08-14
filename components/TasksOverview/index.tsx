/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import TasksModal from './TasksModal'
import SearchModal from './SearchModal'

const TransactionList = () => {
  const [filteredTasks, setFilteredTasks] = useState([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const tasks = [
    {
      id: 1,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Trading research',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Open',
      budget: ['250 USDT'],
    },
    {
      id: 2,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Create a website for a social media plataform',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['FRONTEND', 'BLOCKCHAIN'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'On going',
      budget: ['500 USDC', '50 LINK'],
    },
    {
      id: 3,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'LLM development',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['AI'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Open',
      budget: ['500 USDC', '50 LINK', '700 USDC'],
    },
    {
      id: 4,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Crypto research',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['BLOCKCHAIN'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Finished',
      budget: ['1500 USDC', '50 LINK', '700 USDC'],
    },
    {
      id: 5,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Rust backend development',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['BACKEND', 'BLOCKCHAIN'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Open',
      budget: ['500 USDC', '50 LINK'],
    },
    {
      id: 6,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'LLM development',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['AI'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Finished',
      budget: ['500 USDC', '50 LINK', '700 USDC'],
    },
    {
      id: 7,
      logo: '/images/carousel/blockchainLogo.svg',
      name: 'Marketing managment',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      categories: ['COMMUNITY'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
      deadline: '210203921930',
      status: 'Open',
      budget: ['50 LINK', '700 USDC'],
    },
  ]

  const handleUpdate = () => {
    const filterTasks = () => {
      setFilteredTasks(tasks)
      // setIsLoading(true)
      let newFilteredTasks = tasks
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)

        const status = url.searchParams.get('status')
        if (status) {
          newFilteredTasks = newFilteredTasks.filter(
            (task) => task.status === status,
          )
        }

        const departament = url.searchParams.get('departament')
        if (departament) {
          const departamentValue = Array.isArray(departament)
            ? departament[0]
            : departament
          newFilteredTasks = newFilteredTasks.filter((task) =>
            task.categories.includes(departamentValue),
          )
        }

        const orderBy = url.searchParams.get('orderBy')
        if (orderBy === 'Oldest') {
          newFilteredTasks.sort((a, b) => a.id - b.id)
        } else if (orderBy === 'Newest') {
          newFilteredTasks.sort((a, b) => b.id - a.id)
        }

        const searchBar = url.searchParams.get('searchBar')
        if (searchBar) {
          const searchPhrase = Array.isArray(searchBar)
            ? searchBar[0]
            : searchBar // se searchBar for array, usamos o primeiro elemento
          newFilteredTasks = newFilteredTasks.filter(
            (task) =>
              task.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
              task.description
                .toLowerCase()
                .includes(searchPhrase.toLowerCase()),
          )
        }
        setFilteredTasks(newFilteredTasks)
        setIsLoading(false)
      }
    }

    filterTasks()
  }

  useEffect(() => {
    handleUpdate()
  }, [])

  return (
    <div className="mx-auto mt-44 max-w-6xl items-center justify-center py-6">
      <div className="mb-5 ml-4 flex justify-between border-b border-body-color border-opacity-50 pb-2">
        <h2 className=" mb-2 text-left text-lg font-semibold text-white lg:text-5xl lg:font-bold">
          Tasks
        </h2>
        <button className="duration-80  my-2 cursor-pointer rounded-md border border-transparent bg-primary  px-6 text-center text-sm font-medium text-white outline-none transition ease-in-out hover:bg-opacity-80 hover:shadow-signUp focus-visible:shadow-none">
          New task
        </button>
      </div>
      <SearchModal onUpdate={handleUpdate} />
      <div className="h-[1200px] overflow-auto pr-2 scrollbar scrollbar-thumb-dark">
        {filteredTasks.map((task) => (
          <TasksModal key={task.id} {...task} isLoading={false} />
        ))}
      </div>
    </div>
  )
}

export default TransactionList
