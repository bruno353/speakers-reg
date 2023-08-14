'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
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
import { File, SmileySad, Info } from 'phosphor-react'

const Registration = () => {

  const [stateOpen, setStateOpen] = useState<Boolean>(false)

  function handleChange() {
    setStateOpen(!stateOpen)
  }
    
  return (
    <>
      <section className="px-[100px] pt-[40px]" id={'taskStart'}>
        <div className="container px-0">
          <div className=" text-[#000000] text-[16px] font-normal !leading-[19px]">
            <div className='font-bold !leading-[36px] text-[30px]'>
                Speaker registration
            </div>
            <div className='mt-[38px] flex justify-between'>
                <div className='flex w-[345px]'>
                    <p className='mr-[19px] text-[18px] font-bold flex'>
                        Step 01
                    </p>
                    <p className='w-[251px]'>
                        Pick the industries/areas in which you would share your expertise.
                    </p>
                </div>
                <div className='flex w-[345px]'>
                    <p className='mr-[19px] text-[18px] font-bold'>
                        Step 02
                    </p>
                    <p className='w-[251px]'>
                        Pick the industries/areas in which you would share your expertise.
                    </p>
                </div>
                <div className='flex w-[345px]'>
                    <p className='mr-[19px] text-[18px] font-bold flex items-start'>
                        Step 03
                    </p>
                    <p className='w-[251px]'>
                        Pick the industries/areas in which you would share your expertise.
                    </p>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-x-[10px] gap-y-[9px] mt-[79px]'>
                {!stateOpen ? (
                <div onClick={handleChange} className='bg-[#0354EC] hover:bg-[#173979] cursor-pointer h-[56px] pl-[28px] pr-[13px] flex justify-between font-medium rounded-[5px]  text-white'>
                <div className='!leading-[22px] text-[18px] flex items-center'>
                Securitization of real estate, private equity, tokenization
                </div>
                <div className='text-[30px] !leading-[36px] flex items-center'>
                    +
                </div>
            </div>
                ) : (
                    <div onClick={handleChange} className='bg-[#F3F3F3] cursor-pointer h-[649px] pl-[28px] pr-[13px] font-medium rounded-[5px]  text-white'>
                        <div className='flex justify-between '>
                        <div className='!leading-[22px] text-[18px] flex items-center'>
                    Securitization of real estate, private equity, tokenization
                    </div>
                    <div className='text-[30px] !leading-[36px] flex items-center'>
                        +
                    </div>
                </div>

                </div>
                )}

                <div className='bg-[#0354EC] hover:bg-[#133065] cursor-pointer h-[56px] pl-[28px] pr-[13px] flex justify-between font-medium rounded-[5px]  text-white'>
                    <div className='!leading-[22px] text-[18px] flex items-center'>
                    Securitization of real estate, private equity, tokenization
                    </div>
                    <div className='text-[30px] !leading-[36px] flex items-center'>
                        +
                    </div>
                </div>
                <div className='bg-[#0354EC] h-[56px] pl-[28px] pr-[13px] flex justify-between font-medium rounded-[5px]  text-white'>
                    <div className='!leading-[22px] text-[18px] flex items-center'>
                    Securitization of real estate, private equity, tokenization
                    </div>
                    <div className='text-[30px] !leading-[36px] flex items-center'>
                        +
                    </div>
                </div>
                <div className='bg-[#0354EC] h-[56px] pl-[28px] pr-[13px] flex justify-between font-medium rounded-[5px]  text-white'>
                    <div className='!leading-[22px] text-[18px] flex items-center'>
                    Securitization of real estate, private equity, tokenization
                    </div>
                    <div className='text-[30px] !leading-[36px] flex items-center'>
                        +
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Registration
