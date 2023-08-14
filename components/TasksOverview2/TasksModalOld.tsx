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
    <div className="relative mr-1 items-start justify-between border border-[#e8e5e5]  text-xs lg:text-sm">
      <div className="flex">
        <div className="flex w-[15%] items-center border-r border-[#e8e5e5] px-2">
          <p
            title={task.name}
            className="my-3 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-6"
          >
            {task.name}
          </p>
        </div>
        <div className="flex w-[15%] items-center border-r border-[#e8e5e5] px-2">
          <p
            className="my-3 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-6"
            title={task.categories.join(' | ')}
          >
            {task.categories.join(' | ')}
          </p>
        </div>
        <div className="flex w-[35%] items-center border-r border-[#e8e5e5] px-2">
          <p
            className="my-3 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-6"
            title={task.description}
          >
            {task.description}{' '}
            {/* 150 é o número máximo de caracteres que você quer exibir */}
          </p>
        </div>
        <div className="flex w-[10%] items-center border-r border-[#e8e5e5] px-2 ">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://mumbai.polygonscan.com/address/${task.submitter}`}
            className="my-3 flex hover:text-primary"
          >
            <UserOutlined />
            <p
              className="overflow-hidden text-xs line-clamp-5 lg:text-xs lg:line-clamp-6"
              title={task.submitter}
            >
              {formatAddress(task.submitter)}
            </p>
          </a>
        </div>
        <div className="flex w-[10%] items-center border-r border-[#e8e5e5] px-2">
          <p
            className="my-3 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-6"
            title={task.status}
          >
            {task.status}
          </p>
        </div>
        <div className="flex w-[15%] items-center  px-2">
          <p
            className="my-3 overflow-hidden text-xs line-clamp-5 lg:text-sm lg:line-clamp-6"
            title={task.budget.join(' | ')}
          >
            {task.budget.join(' | ')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TasksModal
