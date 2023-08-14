'use client'
import { TextField, Autocomplete } from '@mui/material'
import { useState, ChangeEvent, useEffect } from 'react'

interface ModalProps {
  onUpdate(): void
}

const SearchModal = ({ onUpdate }: ModalProps) => {
  const [tasksStatus, setTasksStatus] = useState('')
  const [tasksDepartament, setTasksDepartament] = useState('')
  const [tasksOrderBy, setTasksOrderBy] = useState('')
  const [tasksSearchBar, setTasksSearchBar] = useState('')

  const statusOptions = ['Open', 'On going', 'Finished']

  const departamentOptions = [
    'Blockchain',
    'AI',
    'Backend',
    'Frontend',
    'Community',
  ]

  const orderByOptions = ['Newest', 'Oldest']

  const handleStatusSelection = (event: any, value: string | null) => {
    setTasksStatus(value)
    updateUrl('status', value)
  }

  const handleDepartamentSelection = (event: any, value: string | null) => {
    setTasksDepartament(value)
    updateUrl('departament', value)
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
  }

  // Função para atualizar a URL
  const updateUrl = (param: string, value: string | null) => {
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
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)

      const status = url.searchParams.get('status')
      if (status && statusOptions.includes(status)) setTasksStatus(status)

      const departament = url.searchParams.get('departament')
      if (departament && departamentOptions.includes(departament))
        setTasksDepartament(departament)

      const orderBy = url.searchParams.get('orderBy')
      if (orderBy && orderByOptions.includes(orderBy)) setTasksOrderBy(orderBy)

      const searchBar = url.searchParams.get('searchBar')
      if (searchBar && searchBar.length <= 100) setTasksSearchBar(searchBar)
    }
  }, [])

  return (
    <div className="mb-5 ml-4 mr-1 items-start justify-between rounded-md bg-[#121A4D] p-4 text-xs lg:flex lg:text-sm">
      <div className="flex">
        <input
          type="text"
          onInput={handleSearchBarInput}
          value={tasksSearchBar}
          placeholder="Search here..."
          className="palceholder-body-color mr-3 w-full max-w-[300px] rounded-md border border-transparent py-[6px] px-5 text-base font-medium text-white outline-none focus:border-primary dark:bg-white dark:bg-opacity-10"
        />
        <button
          onClick={() => {
            updateUrl('searchBar', tasksSearchBar)
          }}
          disabled={!tasksSearchBar}
          className={`flex h-[37px] w-full max-w-[37px] items-center justify-center rounded-md text-white ${
            !tasksSearchBar ? 'bg-body-color/' : 'bg-primary'
          }`}
        >
          <svg
            width="15"
            height="13"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
      <div className="flex">
        <Autocomplete
          value={tasksStatus}
          onChange={handleStatusSelection}
          className="ml-2 bg-[#2A315F] text-body-color"
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
              sx={{ input: { color: 'white' }, color: 'white' }}
            />
          )}
        />
        <Autocomplete
          value={tasksDepartament}
          onChange={handleDepartamentSelection}
          className="ml-2 bg-[#2A315F] text-body-color"
          options={departamentOptions}
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
              label="Departament"
              variant="outlined"
              id="margin-none"
              sx={{ input: { color: 'white' }, color: 'white' }}
            />
          )}
        />
        <Autocomplete
          value={tasksOrderBy}
          onChange={handleOrderBySelection}
          className="ml-2 bg-[#2A315F] text-body-color"
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
              label="Order by"
              variant="outlined"
              id="margin-none"
              sx={{ input: { color: 'white' }, color: 'white' }}
            />
          )}
        />
      </div>
    </div>
  )
}

export default SearchModal
