/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, useCallback } from 'react'
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
import { User } from '@/types/user'

interface UsersModalProps {
  user: User
  id: string
  ensName: string
}

const HeroUser = ({ user, id, ensName }: UsersModalProps) => {
  const taskStateCircle = {
    open: 'circle-green-task.svg',
    taken: 'circle-yellow-task.svg',
    closed: 'circle-gray-task.svg',
  }

  const taskStatusToButton = {
    open: 'Apply now',
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
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
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

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function formatAddressSecondType(address) {
    return `${address.slice(0, 12)}...`
  }

  const handleCopyClick = useCallback(() => {
    // Usar API de clipboard para copiar o endereço
    navigator.clipboard.writeText(id)
    // mensagem de erro
  }, [id])

  if (user) {
    let githubLink = user.links.find((link) => link.includes('github.com'))
    let twitterLink = user.links.find((link) => link.includes('twitter.com'))

    if (
      githubLink &&
      !githubLink.startsWith('http://') &&
      !githubLink.startsWith('https://')
    ) {
      githubLink = 'https://' + githubLink
    }
    if (
      twitterLink &&
      !twitterLink.startsWith('http://') &&
      !twitterLink.startsWith('https://')
    ) {
      twitterLink = 'https://' + twitterLink
    }

    if (
      user.VerifiedContributorSubmission.length > 0 &&
      user.VerifiedContributorSubmission[0].githubHTMLUrl
    ) {
      githubLink = user.VerifiedContributorSubmission[0].githubHTMLUrl
    }

    return (
      <section className="border-b border-[#CFCFCF] px-[100px] pt-[59px] pb-[70px]">
        <div className="container px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
          <div className="flex">
            <div className="flex cursor-pointer items-center">
              {user.profilePictureHash ? (
                <img
                  alt="ethereum avatar"
                  src={`https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`}
                  className="h-[50px] w-[50px] rounded-[100%] 2xl:h-[100px] 2xl:w-[100px]"
                ></img>
              ) : (
                <img
                  alt="ethereum avatar"
                  src={`https://effigy.im/a/${id}.svg`}
                  className="w-[50px] rounded-full"
                ></img>
              )}
            </div>
            <div
              title={id}
              className={`ml-[20px] flex items-center text-[30px] font-bold ${
                user.name || ensName ? 'text-[#000000]' : 'text-[#D4D4D4]'
              }`}
            >
              {user.name || ensName || formatAddress(id)}
            </div>
            <div
              title={id}
              className={`mr-4 ml-[20px] flex items-center pt-[7px] text-[16px] font-medium text-[#505050]`}
            >
              {formatAddressSecondType(id)}
            </div>
            <div
              onClick={handleCopyClick}
              className="flex cursor-pointer items-center"
            >
              <img
                src={`/images/profile/copy.svg`}
                alt="image"
                className={`w-[17.5px]`}
              />
            </div>
            {((user.VerifiedContributorSubmission.length > 0 &&
              user.VerifiedContributorSubmission[0].status === 'approved') ||
              user.isVerifiedContributor) && (
              <div className="ml-auto flex cursor-pointer items-center  justify-end">
                <div className="flex h-[29px] w-[217px] cursor-pointer items-center  justify-center rounded-[5px] bg-[#12AD50] hover:bg-[#20c964]">
                  <img
                    src="/images/profile/check.svg"
                    alt="image"
                    className={`mr-[10px] w-[20px] `}
                  />
                  <a
                    href="/verified-contributor"
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="text-[16px] font-bold text-[#fff]  "
                  >
                    Verified Contributor
                  </a>
                </div>{' '}
              </div>
            )}
            {user.VerifiedContributorSubmission.length > 0 &&
              user.VerifiedContributorSubmission[0].status === 'pending' && (
                <div className="ml-auto flex cursor-pointer items-center  justify-end">
                  <div className="flex h-[29px] w-[199px] cursor-pointer items-center  justify-center rounded-[5px] bg-[#FBB816] hover:bg-[#f5c149]">
                    <img
                      src="/images/profile/check.svg"
                      alt="image"
                      className={`mr-[10px] w-[20px] `}
                    />
                    <a
                      href="/verified-contributor"
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="text-[16px] font-bold text-[#fff] "
                    >
                      Pending Approval
                    </a>
                  </div>{' '}
                </div>
              )}
          </div>
          <div className="mt-[25px] flex">
            <div className="flex">
              <p>Tags:</p>
              {user.tags && (
                <div className="flex h-fit italic">
                  {user.tags.map((tag, index) => (
                    <span className="ml-2  border-b text-[#505050]" key={index}>
                      {tag}
                      {index !== user.tags.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto flex cursor-pointer items-center  justify-end">
              <a
                href="/edit-profile"
                target="_blank"
                rel="nofollow noreferrer"
                className="flex h-[29px] w-[116px] items-center justify-center rounded-[5px] bg-[#000000] text-[16px] font-bold  text-white hover:bg-[#202020]"
              >
                <span className="">Edit Profile</span>
              </a>
            </div>
          </div>
          <div className="mt-[25px] flex">
            <div className="flex">
              <div className="mr-[60px] flex">
                <img
                  src={`/images/profile/clock.svg`}
                  alt="image"
                  className={`mr-2 w-[18px]`}
                />
                <span className="flex items-center">
                  Contributor since:{' '}
                  <span className="ml-1 font-bold text-[#303030]">
                    {formatDate(user.joinedSince) || '-'}
                  </span>
                </span>
              </div>
              <div className="mr-[60px] flex">
                <img
                  src={`/images/profile/coins.svg`}
                  alt="image"
                  className={`mr-2 w-[18px]`}
                />
                <span className="flex items-center">Total earned:</span>
              </div>
              <div className="mr-[60px] flex">
                <img
                  src={`/images/profile/people.svg`}
                  alt="image"
                  className={`mr-2 w-[18px]`}
                />
                <span className="flex items-center">Job success:</span>
              </div>
            </div>
            <div className="ml-auto flex w-[107px] justify-between">
              <div className="flex items-center">
                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="nofollow noreferrer"
                  >
                    <img
                      src={`/images/profile/github.svg`}
                      alt="image"
                      className={`w-[24.2px]`}
                    />
                  </a>
                )}
              </div>
              <div className="flex items-center">
                {twitterLink && (
                  <a
                    href={twitterLink}
                    target="_blank"
                    rel="nofollow noreferrer"
                  >
                    <img
                      src={`/images/profile/twitter.svg`}
                      alt="image"
                      className={`w-[25px]`}
                    />
                  </a>
                )}
              </div>
              {/* <div className="flex items-center">
                <img
                  src={`/images/profile/share.svg`}
                  alt="image"
                  className={`w-[21.88px]`}
                />
              </div> */}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-[#CFCFCF] px-[100px] pt-[59px] pb-[70px]">
      <div className="container px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
        <div className="flex">
          <div className="flex cursor-pointer items-center">
            <img
              alt="ethereum avatar"
              src={`https://effigy.im/a/${id}.svg`}
              className="w-[50px] rounded-full"
            ></img>
          </div>
          <div
            title={id}
            className={`ml-[20px] flex items-center text-[30px] font-bold ${
              ensName ? 'text-[#000000]' : 'text-[#D4D4D4]'
            }`}
          >
            {ensName || formatAddress(id)}
          </div>
          <div
            title={id}
            className={`mr-4 ml-[20px] flex items-center pt-[7px] text-[16px] font-medium text-[#505050]`}
          >
            {formatAddressSecondType(id)}
          </div>
          <div
            onClick={handleCopyClick}
            className="flex cursor-pointer items-center"
          >
            <img
              src={`/images/profile/copy.svg`}
              alt="image"
              className={`w-[17.5px]`}
            />
          </div>
          {/* <div className="ml-auto flex cursor-pointer items-center  justify-end">
            <a className="flex w-[217px] justify-center rounded-[5px] bg-[#12AD50] py-1 text-[16px] font-bold  text-white hover:bg-[#0e7a39]">
              <img
                src={`/images/profile/check.svg`}
                alt="image"
                className={`mr-2 w-[20.11px]`}
              />
              <span className="">Verified Contributor</span>
            </a>
          </div> */}
        </div>
        <div className="mt-[25px] flex">
          <div className="flex">
            <p>Tags:</p>
          </div>
          <div className="ml-auto flex cursor-pointer items-center  justify-end">
            <a
              href="/edit-profile"
              target="_blank"
              rel="nofollow noreferrer"
              className="flex h-[29px] w-[116px] items-center justify-center rounded-[5px] bg-[#000000] text-[16px] font-bold  text-white hover:bg-[#202020]"
            >
              <span className="">Edit Profile</span>
            </a>
          </div>
        </div>
        <div className="mt-[25px] flex">
          <div className="flex">
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/clock.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">
                Contributor since:{' '}
                <span className="ml-1 font-bold text-[#303030]">{'-'}</span>
              </span>
            </div>
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/coins.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">Total earned:</span>
            </div>
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/people.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">Job success:</span>
            </div>
          </div>
          <div className="ml-auto flex w-[107px] justify-between">
            <div className="flex items-center">
              <img
                src={`/images/profile/github.svg`}
                alt="image"
                className={`w-[24.2px]`}
              />
            </div>
            <div className="flex items-center">
              <img
                src={`/images/profile/twitter.svg`}
                alt="image"
                className={`w-[25px]`}
              />
            </div>
            <div className="flex items-center">
              <img
                src={`/images/profile/share.svg`}
                alt="image"
                className={`w-[21.88px]`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroUser
