'use client'
import { UserOutlined } from '@ant-design/icons'

interface TasksModalProps {
  id: number
  name: string
  description: string
  submitter: string
  deadline: string
  budget: string[]
  status: string
  logo: string
  categories: string[]
}

const TasksModal = (task: TasksModalProps, isLoading: boolean) => {
  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  return (
    <div className="relative mb-8 ml-4 mr-1 items-start justify-between rounded-md bg-[#121A4D] p-4 text-xs lg:flex lg:text-sm">
      <img
        className="ml-5 hidden w-1/5 lg:inline-block"
        src={task.logo}
        alt="image"
      />
      <div className="ml-8 mr-7 lg:w-4/5">
        <div className="max-h-[280px] overflow-hidden ">
          <p
            title={task.name}
            className="text-xl font-semibold line-clamp-1 lg:text-2xl"
          >
            {task.name}
          </p>
          <div className="mb-2 flex space-x-2">
            {task.categories.map((category, index) => (
              <span
                key={index}
                className="mt-4 rounded-full bg-[#071054] px-2 py-1 text-[9px] text-white"
              >
                {category}
              </span>
            ))}
          </div>
          <p
            className="mt-5 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-4"
            title={task.description}
          >
            {task.description}{' '}
            {/* 150 é o número máximo de caracteres que você quer exibir */}
          </p>
        </div>
        <div className="absolute bottom-4 flex w-2/3 justify-between">
          <div className="flex">
            <div className="flex">
              <UserOutlined />
              <p className="ml-1 text-xs" title={task.submitter}>
                {formatAddress(task.submitter)}
              </p>
            </div>
            <div>
              <p className="ml-6 text-xs" title={task.status}>
                <span className="font-semibold">Status:</span> {task.status}
              </p>
            </div>
            <div>
              <p className="ml-6 text-xs" title={task.budget.join(' | ')}>
                <span className="font-semibold">Budget:</span>{' '}
                {task.budget.join(' | ')}
              </p>
            </div>
          </div>
          <div>
            {task.status === 'Open' && (
              <button className="duration-80 cursor-pointer  rounded-sm border border-transparent bg-primary py-1  px-2 text-center text-xs font-medium text-white outline-none transition ease-in-out hover:bg-opacity-80 hover:shadow-signUp focus-visible:shadow-none">
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksModal
