'use client'
/* eslint-disable prettier/prettier */
import { useState } from 'react'
import TransactionModal from './TransactionModal'

const TransactionList = () => {
  const [transactions] = useState([
    {
      id: 1,
      actionIcon: 'FormOutlined',
      actionName: 'Task created',
      transactionHash:
        '0x3D75507A8AdcD2F83bd71029a9a8fDcBaaaadf6393C2131236fdfssfssfffsfsffs',
      transactionDate: '2023-07-01 09:32:01',
    },
    {
      id: 2,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C32137',
      transactionDate: '2023-07-01 10:14:52',
    },
    {
      id: 3,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C213217',
      transactionDate: '2023-07-01 10:14:52',
    },
    {
      id: 4,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C213217',
      transactionDate: '2023-07-01 10:14:52',
    },
    {
      id: 5,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C213127',
      transactionDate: '2023-07-01 10:14:52',
    },
    {
      id: 6,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C213127',
      transactionDate: '2023-07-01 10:14:52',
    },
    {
      id: 7,
      actionIcon: 'FormOutlined',
      actionName: 'Task submitted',
      transactionHash: '0x8Cd914F504e06397952C2aaEb3Aea6cC3B5bD5C32137',
      transactionDate: '2023-07-01 10:14:52',
    },
  ])

  return (
    <div className="my-4 mx-auto max-w-3xl items-center justify-center py-6">
      <h2 className="ml-4  mb-2 text-left text-lg font-semibold text-white lg:text-xl">
        Latest DAO Transactions
      </h2>
      <div className="h-[400px] overflow-auto pr-2 scrollbar scrollbar-thumb-dark">
        {transactions.map((transaction) => (
          <TransactionModal key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

export default TransactionList
