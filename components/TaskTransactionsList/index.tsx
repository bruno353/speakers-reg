/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
'use client'
/* eslint-disable prettier/prettier */
import TransactionModal from './TransactionModal'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { UserOutlined } from '@ant-design/icons'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from '@wagmi/core'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IPFSSubmition, TransactionHistory } from '@/types/task'

const TransactionList = (id: any) => {

  const [taskHistory, setTaskHistory] = useState<TransactionHistory[]>([])

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

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS
  const apiCovalentBase = process.env.NEXT_PUBLIC_COVALENT_API_BASE_URL
  const apiCovalentKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY
  const providerEthers = process.env.NEXT_PUBLIC_JSON_RPC

  const provider = new ethers.JsonRpcProvider(providerEthers)
  const contract = new ethers.Contract(taskAddress, taskContractABI, provider)


  async function getEventsFromTransaction(id: any) {
    let count = 0;
    let hasMore = true;

    while (hasMore) {
        const url = `${apiCovalentBase}/events/address/${taskAddress}/?starting-block=37900503&ending-block=latest&page-number=${count}&page-size=1000000000&key=${apiCovalentKey}`;
        try {
            const response = await axios.get(url);
            console.log(response.data);
            console.log('validation')
            if (response.data.data.items && response.data.data.items.length > 0) {
                for (const item of response.data.data.items) {

                    // ethers reading logs:
                    const dataEvent = item['raw_log_data']
                    const topicsEvent = item['raw_log_topics']
                    const parsedLog = contract.interface.parseLog({data: dataEvent, topics: topicsEvent});
                    console.log(parsedLog)

                    // hash of the event "TaskCreate()" decoded
                    if ((parsedLog.name === "TaskCreated") && (Number(parsedLog.args[0]) === Number(id.id))) {
                        const data = {
                            actionIcon: 'FormOutlined',
                            actionName: 'Task Created',
                            transactionHash: (item['tx_hash']),
                            transactionDate: item['block_signed_at'],
                            addressSender: parsedLog.args[1]
                        }
                        setTaskHistory((prevState) => [...prevState, data]);
                    } else if ((parsedLog.name === "ApplicationCreated") && (Number(parsedLog.args[0]) === Number(id.id))) {
                      const data = {
                        actionIcon: 'FormOutlined',
                        actionName: 'New application',
                        transactionHash: (item['tx_hash']),
                        transactionDate: item['block_signed_at'],
                        addressSender: parsedLog.args[2]
                        }
                        setTaskHistory((prevState) => [...prevState, data]);
                    }
                }
            }

            if (!response.data.pagination['has_more']) {
              hasMore = false;
            } else {
              hasMore = true
            }
            if (hasMore) {
                count++;
            }
        } catch (err) {
            console.log('error during api covalent exec');
            console.log(err);
            hasMore = false
        }
    }
    setIsLoading(false)
}

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      console.log('search for the task info on blockchain')
      console.log(id.id)
      getEventsFromTransaction(id.id)
    }
  }, [id])

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="my-4 py-6">
        <h2 className="mb-4 text-left text-base font-medium text-black">
        </h2>
        <div className="h-[400px] overflow-auto pr-2 animate-pulse bg-[#dfdfdf] text-[#f3f1f1] scrollbar-thin scrollbar-thumb-current">
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="h-[400px] overflow-auto pr-2 text-[#f3f1f1] scrollbar-thin scrollbar-thumb-current">
        {taskHistory.map((transaction, key) => (
          <TransactionModal key={key} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

export default TransactionList
