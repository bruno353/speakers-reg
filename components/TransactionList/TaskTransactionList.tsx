'use client'
/* eslint-disable prettier/prettier */
import { useState } from 'react'
import TransactionModal from './TransactionModal'

const TaskTransactionList = () => {
  const [transactions] = useState([
    {
      id: 1,
      actionIcon: 'FormOutlined',
      actionName: 'Task created',
      transactionHash:
        '0x3D75507A8AdcD2F83bd71029a9a8fDcBaaaadf6393C2131236fdfssfssfffsfsffs',
      transactionDate: '2023-07-01 09:32:01',
    }
  ])

  return (
    <div className="my-4 py-6 w-2/3">
      <h2 className="mb-4 text-left text-base font-medium text-black">
        All activities
      </h2>
      <div className="h-[400px] overflow-auto pr-2 text-[#f3f1f1] scrollbar-thin scrollbar-thumb-current">
        {transactions.map((transaction) => (
          <TransactionModal key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

export default TaskTransactionList
