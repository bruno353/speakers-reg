/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
'use client'
import { TextField, Autocomplete } from '@mui/material'
import { useState, ChangeEvent, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Jazzicon from 'react-jazzicon'

interface ModalProps {
  onUpdate(): void
  scrollManually(): void
  openProjectsNumber: number
  activeProjectsNumber: number
  completedProjectsNumber: number
  draftProjectsNumber: number
}

type DepartamentData = {
  name: string
  tags: string[]
  funding: string
  desc: string
  img: string
  imgClassName: string
}

const SearchModal = ({
  onUpdate,
  scrollManually,
  openProjectsNumber,
  activeProjectsNumber,
  completedProjectsNumber,
  draftProjectsNumber,
}: ModalProps) => {
  const [tasksStatus, setTasksStatus] = useState('')
  const [tasksOrderBy, setTasksOrderBy] = useState('')
  const [tasksSearchBar, setTasksSearchBar] = useState('')
  const [departament, setDepartament] = useState('All')
  const [departamentSelected, setDepartamentSelected] =
    useState<DepartamentData>({
      name: 'All',
      tags: ['Data', 'Graph', 'LLM', 'Solidity', 'Rust', 'Contracts'],
      funding: '330,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/paper.svg',
      imgClassName: 'mr-1 mb-1 w-[16px]',
    })

  const pathname = usePathname()

  const statusOptions = ['open', 'active', 'completed']

  const departamentOptions = [
    {
      name: 'All',
      tags: ['Data', 'Graph', 'LLM', 'Solidity', 'Rust', 'Contracts'],
      funding: '330,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/paper.svg',
      imgClassName: 'mr-1 mb-1 w-[16px]',
    },
    {
      name: 'Data',
      tags: ['Data', 'Graph', 'LLM'],
      funding: '11,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/data.svg',
      imgClassName: 'mr-1 mb-1 w-[16px]',
    },
    {
      name: 'Front-end',
      tags: ['Web', 'Mobile', 'Desktop'],
      funding: '51,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/pointer.svg',
      imgClassName: 'mr-1 mb-1 w-[13px]',
    },
    {
      name: 'Blockchain',
      tags: ['Solidity', 'Rust', 'Contracts'],
      funding: '89,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/blockchain.svg',
      imgClassName: 'mr-1 mb-1 w-[16px]',
    },
    {
      name: 'DevOps/Cloud',
      tags: ['DevOps', 'AWS', 'Kubernets'],
      funding: '151,231',
      desc: 'Introducing the OpenR&D initiative, an open-source platform designed to empower decentralized teams to collaborate seamlessly. Simplify task management, progress tracking, and automated payouts within web3 projects, addressing the challenges faced by remote teams in the rapidly growing decentralized ecosystem.',
      img: '/images/departaments/cloud.svg',
      imgClassName: 'mr-1 mb-1 w-[19px]',
    },
  ]
  const orderByOptions = ['Newest', 'Oldest']

  const handleStatusSelection = (value: string | null) => {
    setTasksStatus(value)
    updateUrl('status', value)
  }

  const handleOrderBySelection = (event: any, value: string | null) => {
    setTasksOrderBy(value)
    updateUrl('orderBy', value)
  }

  const handleSearchBarInput = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const value = input.value

    if (tasksSearchBar.length + value.length > 100) {
      return
    }

    setTasksSearchBar(value)

    if (value === '') {
      updateUrl('searchBar', value)
    }
  }

  const handleDepartamentSelection = (value: string) => {
    updateUrl('departament', value)
    setDepartament(value)
    // setar setDepartamentSelected() passando o departament que tem o parametro "name" igual ao value que essa func recebe
    const selectedDepartament = departamentOptions.find(
      (departament) => departament.name === value,
    )
    setDepartamentSelected(selectedDepartament)
  }

  // Função para atualizar a URL
  const updateUrl = (param: string, value: string | null) => {
    console.log('update chamado com sucesso')
    if (param !== 'page') {
      console.log('nao é page')
      if (typeof window !== 'undefined') {
        console.log('nao é page2')
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
      onUpdate()
    }
  }

  useEffect(() => {
    setDepartament('All')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)

      const status = url.searchParams.get('status')
      if (status && statusOptions.includes(status)) setTasksStatus(status)

      const departament = url.searchParams.get('departament')
      if (departament && departament !== 'All') {
        setDepartament(departament)
      }

      const orderBy = url.searchParams.get('orderBy')
      if (orderBy && orderByOptions.includes(orderBy)) setTasksOrderBy(orderBy)

      const searchBar = url.searchParams.get('searchBar')
      if (searchBar && searchBar.length <= 100) setTasksSearchBar(searchBar)
    }
  }, [pathname])

  return (
    <section className="mt-[34px] px-[100px]">
      <div className="container px-0">
        <div className="flex">
          <input
            type="text"
            onInput={handleSearchBarInput}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateUrl('searchBar', tasksSearchBar)
                scrollManually()
              }
            }}
            value={tasksSearchBar}
            placeholder="Search here..."
            className="mr-3 h-[52px] w-[600px] rounded-[10px] border border-[#0085FF] bg-white py-[12px] px-5 text-[18px] font-normal text-[#000000] placeholder-[#9b9b9b] outline-none focus:border-primary dark:bg-opacity-10"
          />
          {/* <button
            onClick={() => {
              updateUrl('searchBar', tasksSearchBar)
              scrollManually()
            }}
            className={`flex h-[47px] w-full max-w-[37px] items-center justify-center rounded-md`}
          >
            <svg
              width="19"
              height="16"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                fill={`black`}
              />
            </svg>
          </button> */}
        </div>
        <div className="mt-[69px] flex  text-xl text-[16px] font-bold text-[#0354EC]">
          <div
            className={`mr-[40px] flex pr-[5px] ${
              departament === 'All' || !departament
                ? 'border-b-2 border-[#0354EC]'
                : ''
            }`}
          >
            <img
              src="/images/departaments/paper.svg"
              alt="image"
              className={`mr-1 mb-1 w-[19px]`}
            />
            <span
              onClick={() => {
                handleDepartamentSelection('All')
              }}
              className={`flex cursor-pointer items-center pb-[3px] hover:text-primary ${
                departament === 'All' || !departament ? '' : ''
              }`}
            >
              All
            </span>
          </div>
          {departamentOptions.map((departamentOption, index) => {
            if (departamentOption.name !== 'All') {
              return (
                <div
                  key={index}
                  className={`mr-[5px] flex px-[35px] ${
                    departament === departamentOption.name
                      ? 'border-b-2 border-[#0354EC]'
                      : ''
                  }`}
                >
                  <img
                    src={`${departamentOption.img}`}
                    alt="image"
                    className={departamentOption.imgClassName}
                  />
                  <span
                    onClick={() => {
                      handleDepartamentSelection(departamentOption.name)
                    }}
                    className={`flex cursor-pointer items-center pb-[3px] hover:text-primary ${
                      departament === departamentOption.name ? '' : ''
                    }`}
                  >
                    {departamentOption.name}
                  </span>
                </div>
              )
            }
          })}
          <div className="ml-auto flex  items-end justify-end text-[16px] font-bold text-white">
            <a
              href="/new-task"
              target="_blank"
              rel="nofollow noreferrer"
              className="ml-auto flex h-[43px] w-[170px] cursor-pointer items-center  justify-center rounded-[10px] bg-[#0354EC] hover:bg-primary"
            >
              + Add a project
            </a>
          </div>
        </div>
        <div className="mt-[39px] items-start justify-start rounded-[10px] border border-[#D4D4D4] py-[40px] px-[50px] text-[14px] font-medium text-[#505050]">
          {departamentSelected ? (
            <>
              <div className="">
                <p className="!leading-[17px]">{departamentSelected.desc}</p>
              </div>
              <div className="mt-[25px] flex">
                <p className="mr-1">Tags: </p>
                <div className="flex italic">
                  {departamentSelected.tags.map((tag, index) => (
                    <p className="ml-2 border-b" key={index}>
                      {tag}
                      {index !== departamentSelected.tags.length - 1 && ', '}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-[25px] flex">
                <p className="mr-[3px]">Avalaible Funding: </p>
                <div className="flex">
                  <p className="mr-[22px] text-[16px] font-bold text-[#000000]">
                    ${departamentSelected.funding}
                  </p>
                  <img
                    src="/images/tokens/tokens-logo-2.svg"
                    alt="image"
                    className={`w-[72px]`}
                  />
                </div>
              </div>
              <div className=" mt-[25px] flex">
                <div className="mr-2">
                  <Jazzicon diameter={30} seed={2121214554432222} />
                </div>
                <div className="mr-2">
                  <Jazzicon diameter={30} seed={21212122987978} />
                </div>
                <div className="mr-4">
                  <Jazzicon diameter={30} seed={212213211212122} />
                </div>
                <div>
                  <p className="mb-0 border-spacing-0 border-b pb-0 text-[#000000]">
                    12 contributors
                  </p>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="mt-[40px] flex text-[#000000]">
          <div
            onClick={() => {
              handleStatusSelection('draft')
            }}
            className={`w-1/3 cursor-pointer rounded-[10px] border border-[#D4D4D4] px-[25px] py-[20px] hover:bg-[#F1F0F0] ${
              tasksStatus === 'draft' ? 'bg-[#F1F0F0]' : ''
            }`}
          >
            <p className="text-[16px] font-bold">Draft Projects</p>
            <p className="text-[14px] font-normal">
              Waiting for approval or for assigning
            </p>
            <p
              className={`mt-[9px] w-fit text-[26px] font-bold !leading-none ${
                tasksStatus === 'draft' ? 'border-b-[2px] border-[#000000]' : ''
              }`}
            >
              {draftProjectsNumber}
            </p>
          </div>
          <div
            onClick={() => {
              handleStatusSelection('open')
            }}
            className={`ml-[25px] w-1/3 cursor-pointer rounded-[10px] border border-[#D4D4D4] px-[25px] py-[20px] hover:bg-[#F1F0F0] ${
              tasksStatus === 'open' ? 'bg-[#F1F0F0]' : ''
            }`}
          >
            <p className="text-[16px] font-bold">Open Projects</p>
            <p className="text-[14px] font-normal">
              Waiting for approval or for assigning
            </p>
            <p
              className={`mt-[9px] w-fit text-[26px] font-bold !leading-none ${
                tasksStatus === 'open' ? 'border-b-[2px] border-[#000000]' : ''
              }`}
            >
              {openProjectsNumber}
            </p>
          </div>
          <div
            onClick={() => {
              handleStatusSelection('active')
            }}
            className={`mx-[25px] w-1/3 cursor-pointer rounded-[10px] border border-[#D4D4D4] px-[25px] py-[20px] hover:bg-[#F1F0F0] ${
              tasksStatus === 'active' ? 'bg-[#F1F0F0]' : ''
            }`}
          >
            <p className="text-[16px] font-bold">Active Projects</p>
            <p className="text-[14px] font-normal">
              Waiting for approval or for assigning
            </p>
            <p
              className={`mt-[9px] w-fit text-[26px] font-bold !leading-none ${
                tasksStatus === 'active'
                  ? 'border-b-[2px] border-[#000000]'
                  : ''
              }`}
            >
              {activeProjectsNumber}
            </p>
          </div>
          <div
            onClick={() => {
              handleStatusSelection('completed')
            }}
            className={`w-1/3 cursor-pointer rounded-[10px] border border-[#D4D4D4] px-[25px] py-[20px] hover:bg-[#F1F0F0] ${
              tasksStatus === 'completed' ? 'bg-[#F1F0F0]' : ''
            }`}
          >
            <p className="text-[16px] font-bold">Completed Projects</p>
            <p className="text-[14px] font-normal">
              Waiting for approval or for assigning
            </p>
            <p
              className={`mt-[9px] w-fit text-[26px] font-bold !leading-none ${
                tasksStatus === 'completed'
                  ? 'border-b-[2px] border-[#000000]'
                  : ''
              }`}
            >
              {completedProjectsNumber}
            </p>
          </div>
        </div>

        {/* <div className="flex">
        <Autocomplete
          value={tasksStatus}
          onChange={handleStatusSelection}
          className="ml-2  text-body-color"
          options={statusOptions}
          getOptionLabel={(option) => `${option}`}
          sx={{
            color: 'white',
            width: '150px',
          }}
          size="small"
          filterOptions={(options, state) =>
            options.filter((option) =>
              option.toLowerCase().includes(state.inputValue.toLowerCase()),
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Status"
              variant="outlined"
              id="margin-none"
              sx={{ input: { color: 'black' }, color: 'black' }}
            />
          )}
        />
        <Autocomplete
          value={tasksOrderBy}
          onChange={handleOrderBySelection}
          className="ml-2  text-body-color"
          options={orderByOptions}
          getOptionLabel={(option) => `${option}`}
          sx={{
            color: 'white',
            width: '150px',
          }}
          size="small"
          filterOptions={(options, state) =>
            options.filter((option) =>
              option.toLowerCase().includes(state.inputValue.toLowerCase()),
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sort by"
              variant="outlined"
              id="margin-none"
              sx={{ input: { color: 'black' }, color: 'black' }}
            />
          )}
        />
      </div> */}
      </div>
    </section>
  )
}

export default SearchModal
