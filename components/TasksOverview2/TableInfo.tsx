'use client'

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

const TableInfo = (task: TasksModalProps, isLoading: boolean) => {
  return (
    <tr>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
      <td className="break-all border-t px-4 py-2">{task.name}</td>
    </tr>
  )
}

export default TableInfo
