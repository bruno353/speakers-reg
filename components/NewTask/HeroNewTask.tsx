/* eslint-disable react/no-unescaped-entities */
// import Image from 'next/image'
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from '@wagmi/core'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IPFSSubmition } from '@/types/task'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import { BigNumberish } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'

const HeroNewTasks = () => {
  const { address, isConnecting, isDisconnected } = useAccount()

  if (!address) {
    return (
      <section className="border-b border-[#CFCFCF] px-32 pb-[43px] pt-[40px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-start">
            <div className="wow fadeInUp" data-wow-delay=".2s">
              <div className="mb-1">
                <h3 className="text-[20px] font-bold text-[#000000]">
                  Add New Project
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-4 text-[#000000]">
            Connect you wallet to continue
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="border-b border-[#CFCFCF] px-32 pb-[43px] pt-[40px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-start">
          <div className="w-full px-4 lg:w-2/3">
            <div className="mb-1">
              <h3 className="text-[20px] font-bold !leading-[150%] text-[#000000]">
                Add New Project
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroNewTasks
