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
import DOMPurify from 'dompurify'
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser'

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
import { IPFSSubmition, TasksOverview } from '@/types/task'
import HeroTask from './HeroTask'
import UpdatesList from './UpdatesList'
import ApplicantsSubmissionsList from './ApplicantsSubmissionsList'

const TaskView = (id: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imgTaskIPFS, setImgTaskIPFS] = useState('')
  const [viewOption, setViewOption] = useState('projectDescription')
  const [taskMetadata, setTaskMetadata] = useState<TasksOverview>()
  const [contributorsAllowed, setContributorsAllowed] = useState([])

  const { push } = useRouter()
  const { address } = useAccount()

  const taskStateCircle = {
    open: 'circle-green-task.svg',
    taken: 'circle-yellow-task.svg',
    closed: 'circle-gray-task.svg',
  }

  const taskState = [
    { state: 'Open', img: 'circle-green-task.svg' },
    { state: 'Taken', img: 'circle-yellow-task.svg' },
    { state: 'Closed', img: 'circle-gray-task.svg' },
  ]

  async function getTask(id: any) {
    const dataBody = {
      id,
    }
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getTask`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data: dataBody,
    }

    try {
      await axios(config).then(function (response) {
        if (response.data) {
          setTaskMetadata(response.data)
          if (response.data['Application']) {
            const contributors = response.data['Application']
              .filter((app) => app.taken === true)
              .map((app) => app.applicant)
            setContributorsAllowed(contributors)
          }
        }
      })
    } catch (err) {
      toast.error('Task undefined!')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      push('/')
      console.log(err)
    }

    setIsLoading(false)
  }

  function returnContributors() {
    if (!contributorsAllowed || contributorsAllowed.length === 0) {
      return <div className="mt-[20px]">Empty</div>
    } else {
      return (
        <div>
          {contributorsAllowed.map((contributor, index) => (
            <div
              className="mt-[20px] flex items-center text-[16px] font-medium"
              key={index}
            >
              <img
                alt="ethereum avatar"
                src={`https://effigy.im/a/${contributor}.svg`}
                className=" mr-[20px] w-[30px] rounded-full"
              ></img>
              <a
                title={contributor}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
                href={`/profile/${contributor}`}
              >
                {formatAddress(contributor)}
              </a>
            </div>
          ))}
        </div>
      )
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (id) {
      setIsLoading(true)
      console.log('search for the task info on blockchain')
      console.log(id.id)
      getTask(id.id)
    }
  }, [id])
  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function transform(node, index) {
    if (node.type === 'tag') {
      switch (node.name) {
        case 'h1':
          node.attribs.style = 'font-size: 2rem; font-weight: bold;'
          break
        case 'h2':
          node.attribs.style = 'font-size: 1.5rem; font-weight: bold;'
          break
        case 'ul':
          node.attribs.style = 'list-style: disc; margin-left: 40px;' // Ajuste o valor conforme necessário
          break
        case 'ol':
          node.attribs.style = 'list-style: decimal; margin-left: 40px;' // Ajuste o valor conforme necessário
          break
        case 'strong':
        case 'b':
          node.attribs.style = 'font-weight: bold;'
          break
        case 'em':
        case 'i':
          node.attribs.style = 'font-style: italic;'
          break
        case 'li':
          if (
            node.attribs.class &&
            node.attribs.class.includes('ql-indent-1')
          ) {
            node.attribs.style = 'margin-left: 30px;' // Adicione mais estilos se a classe ql-indent-1 tiver especificidades
          }
          break
        // Adicione mais casos conforme necessário
      }
    }
    return convertNodeToElement(node, index, transform)
  }

  if (isLoading || !taskMetadata) {
    return (
      <section className="py-16 px-32 text-black md:py-20 lg:pt-40">
        <div className="container flex h-60 animate-pulse px-0 pb-12">
          <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
          <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
        </div>
        <div className="container h-96 animate-pulse bg-[#dfdfdf] pb-12"></div>
      </section>
    )
  }

  return (
    <>
      <HeroTask
        task={taskMetadata}
        contributorsAllowed={contributorsAllowed}
        address={address}
      />
      <section className="px-[100px] pt-[59px] pb-[250px]">
        <div className="container mt-12  px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
          <div className="flex flex-wrap items-start">
            <div className="w-full">
              {taskMetadata.metadataEdited && (
                <div className="-mt-[60px] mb-[40px] flex w-full rounded-[10px] bg-[#FFF6E0] py-[30px] px-[63px]">
                  <div className="mr-[25px] mb-0 flex w-[35px] flex-none items-center">
                    <img
                      alt="warning"
                      src="/images/task/warning.svg"
                      className=""
                    ></img>
                  </div>
                  <div className="!leading-[150%]">
                    The task's metadata seems to have changed. We recommend
                    reaching out to the{' '}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/profile/${taskMetadata.executor}`}
                      className="mr-1 border-b border-[#0354EC] pl-1 text-[#0354EC]"
                    >
                      project creator{' '}
                    </a>{' '}
                    to know more about it.
                  </div>
                </div>
              )}
              <div className="flex font-bold !leading-[150%]">
                <div
                  className={`px-[17px]  pb-[14px] ${
                    viewOption === 'projectDescription'
                      ? 'border-b-[2px] border-[#000000]'
                      : ''
                  }`}
                >
                  <p
                    onClick={() => {
                      setViewOption('projectDescription')
                    }}
                    className="cursor-pointer hover:text-[#353535]"
                  >
                    Project description
                  </p>
                </div>
                <div
                  className={`mx-[57px] px-[17px]  pb-[14px] ${
                    viewOption === 'submissions'
                      ? 'border-b-[2px]  border-[#000000]'
                      : ''
                  }`}
                >
                  <p
                    onClick={() => {
                      setViewOption('submissions')
                    }}
                    className="cursor-pointer hover:text-[#353535]"
                  >
                    Applicants & submissions
                  </p>
                </div>
                <div
                  className={`px-[17px]  pb-[14px] ${
                    viewOption === 'updates'
                      ? 'border-b-[2px]  border-[#000000]'
                      : ''
                  }`}
                >
                  <p
                    onClick={() => {
                      setViewOption('updates')
                    }}
                    className="cursor-pointer hover:text-[#353535]"
                  >
                    Updates ({taskMetadata.updatesCount})
                    {/* Aqui inserir o numero de updates (transactions events) que teve */}
                  </p>
                </div>
              </div>
              {viewOption !== 'submissions' ? (
                <div>
                  <div className="mt-[49px] flex">
                    {viewOption === 'projectDescription' ? (
                      <div className="mr-[50px] w-full text-[16px] font-normal !leading-[150%]">
                        {imgTaskIPFS ? (
                          <img
                            src={imgTaskIPFS}
                            alt="project desc"
                            className="mb-[50px] h-[375px] w-[375px]"
                          ></img>
                        ) : (
                          <></>
                        )}
                        {(() => {
                          // const cleanHtml = DOMPurify.sanitize(
                          //   '<h1>New project information</h1><p><br></p><h2>Specs</h2><ul><li><strong>Lorem ipsum religaris:</strong></li><li class="ql-indent-1">sddsaddsadsadsasasasasasasasasasasadsadasdsadsadasdasdasdsadwqopidmwqmodw</li><li class="ql-indent-1">qwmpodwopqdmopwqmdopwqmodpmwqopdmpowqmdop</li><li class="ql-indent-1">wqopmdmqwopdmopqwmdopqwpdqwmkopwqmdpowqmdopqwmdopmqwmdop</li><li><strong>Lorem ipsum religaris:</strong></li><li class="ql-indent-1">sddsaddsadsadsasasasasasasasasasasadsadasdsadsadasdasdasdsadwqopidmwqmodw</li><li class="ql-indent-1">qwmpodwopqdmopwqmdopwqmodpmwqopdmpowqmdop</li><li class="ql-indent-1">wqopmdmqwopdmopqwmdopqwpdqwmkopwqmdpowqmdopqwmdopmqwmdop</li></ul><p><br></p><h2>Scope</h2><ul><li><strong>Lorem ipsum religaris:</strong></li><li><strong>Lorem ipsum religaris:</strong></li><li><strong>Lorem ipsum religaris: dsad</strong></li><li><strong>Lorem ipsum religaris:</strong></li><li><strong>Lorem ipsum religaris:</strong></li><li><strong>Lorem ipsum religaris:</strong></li><li><strong>Lorem ipsum religaris:</strong></li></ul>',
                          // )
                          const cleanHtml = DOMPurify.sanitize(
                            taskMetadata.description,
                          )

                          const htmlTransformado = ReactHtmlParser(cleanHtml, {
                            transform,
                          })

                          return <div>{htmlTransformado}</div>
                        })()}
                      </div>
                    ) : (
                      <UpdatesList taskId={id.id} />
                    )}
                    <div className="w-[400px] text-[#505050]">
                      <div className="shadow-lg">
                        <div className="flex h-[79px] items-center bg-[#F7F8F9] px-[30px] font-bold">
                          <p>More details</p>
                        </div>
                        <div className="flex h-[270px] items-center px-[30px]">
                          <div>
                            <a
                              href="https://github.com/"
                              target="_blank"
                              rel="nofollow noreferrer"
                              className="border-b border-[#0354EC] font-normal text-[#0354EC]"
                            >
                              View on Github
                            </a>
                            <div className="mt-[25px]">
                              <p className="font-bold">Last Updated:</p>
                              <p>3 days ago</p>
                            </div>
                            <div className="mt-[25px]">
                              <p className="font-bold">Next meeting:</p>
                              <p>10:30 PM UTC 23-12-2021</p>
                            </div>
                            <div className="mt-[25px]">
                              <p>Reacht out to a</p>
                              <a
                                href="https://github.com/"
                                target="_blank"
                                rel="nofollow noreferrer"
                                className="border-b border-[#0354EC] text-[#0354EC]"
                              >
                                verified contributor
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-[40px] shadow-lg">
                        <div className="flex h-[79px] items-center bg-[#F7F8F9] px-[30px] font-bold">
                          <p>Contributors</p>
                        </div>
                        <div className="max-h-[500px] overflow-auto px-[30px] pb-[40px] pt-[20px]">
                          {returnContributors()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {viewOption === 'projectDescription' && (
                    <div className=" mt-[50px] mr-[400px] flex rounded-md bg-[#F5F5F5] py-[43px]  pl-[49px] text-center text-[16px] font-medium !leading-[19px] text-[#505050]">
                      <p>
                        | Have more questions? Reach out to{' '}
                        <a
                          href="https://mumbai.polygonscan.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="border-b border-[#0084FE] text-[#0084FE]"
                        >
                          a verified contributor
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <ApplicantsSubmissionsList
                  dataApplication={taskMetadata.Application}
                  dataSubmission={taskMetadata.Submission}
                  taskId={String(taskMetadata.id)}
                  taskPayments={taskMetadata.payments}
                  taskDeadline={String(taskMetadata.deadline)}
                  taskProjectLength={taskMetadata.projectLength}
                  budget={taskMetadata.estimatedBudget}
                  address={address}
                  taskExecutor={taskMetadata.executor}
                  contributorsAllowed={contributorsAllowed}
                  status={taskMetadata.status}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default TaskView
