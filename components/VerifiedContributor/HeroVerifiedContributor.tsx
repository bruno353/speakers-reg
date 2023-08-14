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

const HeroVerifiedContributor = () => {
  const { address, isConnecting, isDisconnected } = useAccount()

  return (
    <section className="border-b border-[#CFCFCF] px-32 pb-[51px] pt-[40px]">
      <div className="container px-0">
        <div className="flex flex-wrap items-start">
          <div className="w-full 2xl:w-2/3">
            <div className="mb-1 flex">
              <p className="text-[20px] font-bold !leading-[150%] text-[#000000]">
                Become a Verified Contributor{' '}
              </p>
              <img
                src={`/images/verified-contributor/check.svg`}
                alt="image"
                className={`ml-[10px] flex w-[17px] cursor-pointer items-center`}
              />
            </div>
          </div>
          <div className="mt-[25px] max-w-[1169px] text-[#505050]">
            <p className="text-[14px] font-medium !leading-[17px]">
              Verified contributors are set of users that have more access to
              functionalities such as approving tasks, adjusting project
              deadlines, and voting for applicants. They typically are core
              developers and researchers with technical knowledge and expertise
              in the fields and are vetted by the community.
            </p>
          </div>
          <div className="mt-[25px] flex text-[14px] font-medium !leading-[17px] text-[#505050]">
            <div className="mr-[20px]">
              <div className="flex">
                <img
                  src="/images/verified-contributor/check-3.svg"
                  alt="image"
                  className={`mr-[4px] w-[12px]`}
                />
                <p>Approve tasks and proposals</p>
              </div>
              <div className="mt-[15px] flex">
                <img
                  src="/images/verified-contributor/check-3.svg"
                  alt="image"
                  className={`mr-[4px] w-[12px]`}
                />
                <p>Adjust project budget and timeline</p>
              </div>
            </div>
            <div>
              <div className="flex">
                <img
                  src="/images/verified-contributor/check-3.svg"
                  alt="image"
                  className={`mr-[4px] w-[12px]`}
                />
                <p>Nominate applicants</p>
              </div>
              <div className="mt-[15px] flex">
                <img
                  src="/images/verified-contributor/check-3.svg"
                  alt="image"
                  className={`mr-[4px] w-[12px]`}
                />
                <p>Vote on governance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroVerifiedContributor
