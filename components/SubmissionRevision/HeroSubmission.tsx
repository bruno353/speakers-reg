/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { UserOutlined } from '@ant-design/icons'
import TransactionList from '../TaskTransactionsList'
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
import { formatDistanceToNow } from 'date-fns'
import { TasksOverview, Submission } from '@/types/task'

interface TasksModalProps {
  submission: Submission
  contributorsAllowed: string[] | null
  address: string | null
}

const HeroSubmission = ({
  submission,
  contributorsAllowed,
  address,
}: TasksModalProps) => {
  const taskStateCircle = {
    open: 'circle-green-task-hero.svg',
    active: 'circle-blue-task-hero.svg',
    closed: 'circle-black-task-hero.svg',
  }

  const taskStatusToButton = {
    open: 'Apply now',
  }

  function truncateHash(hash) {
    const start = hash.slice(0, 5)
    const end = hash.slice(-5)
    return `${start}...${end}`
  }

  // USDC, USDT AND WETH for POLYGON
  const tokensAllowedMap = {
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'usd-coin-usdc-logo',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 'tether-usdt-logo',
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 'generic-erc20',
  }

  function getTokenLogo(address: string) {
    if (tokensAllowedMap[address]) {
      return tokensAllowedMap[address]
    } else {
      return 'generic-erc20'
    }
  }

  function returnSubmissionRevisionCircle() {
    if (submission) {
      if (submission.reviewed) {
        if (submission.accepted) {
          return `/images/task/circle-green-task-hero.svg`
        } else {
          return `/images/task/circle-red-task-hero.svg`
        }
      } else {
        return `/images/task/circle-yellow-task-hero.svg`
      }
    }
  }

  function submissionRevisionStatus() {
    if (submission) {
      if (submission.reviewed) {
        if (submission.accepted) {
          return 'Accepted'
        } else {
          return 'Recused'
        }
      } else {
        return 'To be reviewed'
      }
    }
  }
  function findGithubLink(array) {
    const item = array.find((obj) => obj.title === 'githubLink')

    if (item) {
      if (item.url.startsWith('https://')) {
        return item.url
      } else {
        return 'https://' + item.url
      }
    } else {
      return 'https://www.github.com'
    }
  }

  function capitalizeFirstLetter(string) {
    if (string === 'active') {
      return 'On-going'
    } else {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    }
  }

  function formatDate(timestamp: string) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const date = new Date(Number(timestamp) * 1000)

    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  }

  function formatDateAgo(timestamp) {
    const date = new Date(Number(timestamp) * 1000)
    let difference = formatDistanceToNow(date)

    // Aqui estamos tratando a frase para exibir 'today' se a task foi criada no mesmo dia
    difference = `${difference.charAt(0).toUpperCase()}${difference.slice(
      1,
    )} ago`
    return difference
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <section className="border-b border-[#CFCFCF] px-[100px] pt-[59px] pb-[70px]">
      <div className="container px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
        <div className="-mx-4 flex flex-wrap items-start">
          <div className="w-full px-4">
            <div className="flex justify-between">
              <div className="w-full">
                <h3 className="mb-[15px] overflow-hidden text-ellipsis whitespace-nowrap  text-[20px] font-bold !leading-[120%]">
                  #{submission.submissionId} Submission
                </h3>
                <div className="mt-[10px] flex text-[14px]  text-[#505050]">
                  <p className="font-bold">Description: </p>
                  <div className="ml-[5px] flex">
                    {submission.metadataDescription}
                  </div>
                </div>
                <div className="mt-[15px] mb-[35px] flex text-[14px]  text-[#505050]">
                  <p className="font-bold">Links: </p>
                  <div className="flex italic">
                    {submission.metadataAdditionalLinks &&
                      submission.metadataAdditionalLinks.map((links, index) => (
                        <p
                          className="ml-1 border-b border-[#505050]"
                          key={index}
                        >
                          {links}
                          {index !==
                            submission.metadataAdditionalLinks.length - 1 &&
                            ', '}
                        </p>
                      ))}
                  </div>
                </div>
                <div className="mt-[25px] flex text-[16px] font-medium text-[#505050]">
                  <div className="mr-[22px] flex">
                    <img
                      src="/images/task/clock.svg"
                      alt="image"
                      className={`mr-[10px] w-[22px]`}
                    />
                    <p className="mr-[3px] flex items-center">Created:</p>{' '}
                    <span className="flex items-center text-[14px] font-medium text-[#000000]">
                      {formatDateAgo(submission.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="mt-[25px] flex text-[16px] font-medium text-[#505050]">
                  <div className="mr-[50px] flex">
                    <img
                      src="/images/task/people.svg"
                      alt="image"
                      className={`mr-[10px] w-[22px]`}
                    />
                    <p className="mr-[3px] flex items-center">Applicant:</p>{' '}
                    <span className="flex items-center text-[14px] font-medium text-[#303030]">
                      {submission.applicant}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-[163px]">
                {' '}
                <div className="text-[16px] font-bold text-[#000000]">
                  <div className="flex !leading-[150%]">Status:</div>
                  <div className="mt-[6px] flex">
                    <img
                      src={returnSubmissionRevisionCircle()}
                      alt="image"
                      className={`mr-[10px] w-[20px]`}
                    />
                    <p className="text-[16px] font-medium text-[#303030]">
                      {submissionRevisionStatus()}
                    </p>
                  </div>
                </div>
                {/* <div className="mt-[25px] text-[16px] font-bold !leading-[150%] text-[#000000]">
                  <p> Deadline: </p>
                  <p className="font-medium text-[#303030]">
                    {formatDate(task.deadline)}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSubmission
