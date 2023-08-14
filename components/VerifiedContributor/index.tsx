/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import { Range } from 'react-range'
import { TextField, Autocomplete } from '@mui/material'
import { Slider } from 'rsuite'
import Decimal from 'decimal.js'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
  watchContractEvent,
  signMessage,
} from '@wagmi/core'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import axios from 'axios'
import { Link, TasksOverview } from '@/types/task'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HeroTask from '../TaskView/HeroTask'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import HeroVerifiedContributor from './HeroVerifiedContributor'
import { User } from '@/types/user'
import { createHash } from 'crypto'

type VerifiedContributorForm = {
  description: string
}

type Payment = {
  tokenContract: string
  amount: number
  nextToken: boolean
}

type FileListProps = {
  files: File[]
  onRemove(index: number): void
}

const VerifiedContributor = (id: any) => {
  Decimal.set({ precision: 60 })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isApplicationLoading, setIsApplicationLoading] =
    useState<boolean>(false)
  const [viewOption, setViewOption] = useState('projectDescription')
  const [displayName, setDisplayName] = useState('')
  const [ipfsFileHash, setIPFSFileHash] = useState()
  const [updatesNonce, setUpdatesNonce] = useState()
  const [taskChainData, setTaskChainData] = useState<any>()
  const [githubData, setGithubData] = useState<any>()
  const [tagsValues, setTagsValues] = useState([])
  const [linksValues, setLinksValues] = useState([])
  const [taskMetadata, setTaskMetadata] = useState<TasksOverview>()
  const [budgetValue, setBudgetValue] = useState([100])
  const [budgetValueInputColor, setBudgetValueInputColor] =
    useState<String>('#009A50')
  const [estimatedBudgetRequested, setEstimatedBudgetRequested] =
    useState<String>('')
  const [budgetPercentage, setBudgetPercentage] = useState(100)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [ipfsHashTaskData, setIpfsHashTaskData] = useState<String>('')
  const [userProfile, setUserProfile] = useState<User | null>()

  const [howLikelyToMeetTheDeadlineValue, setHowLikelyToMeetTheDeadlineValue] =
    useState('')
  const colorsBudget = [
    '#39D303',
    '#31ce19',
    '#2aca24',
    '#22c52d',
    '#1ac033',
    '#12bc39',
    '#09b73e',
    '#01b242',
    '#00ad46',
    '#009A50',
    '#00a44c',
    '#009f4e',
    '#009a50',
    '#32973e',
    '#4a942b',
    '#5d9015',
    '#6e8c00',
    '#7e8700',
    '#8d8100',
    '#9c7a00',
    '#ab7200',
    '#b86900',
    '#c55e00',
    '#d15101',
    '#db421c',
  ]

  const rangePerColor = 250 / colorsBudget.length

  const [payments, setPayments] = useState<Payment[]>([])

  const [links, setLinks] = useState<Link[]>([
    { title: 'githubLink', url: '' },
    { title: 'additionalLink', url: '' },
  ])

  const getColor = (value) => {
    if (value < 50) {
      return 'bg-yellow-500'
    } else if (value > 150) {
      return 'bg-orange-500'
    } else {
      return 'bg-green-500'
    }
  }

  const { address } = useAccount()
  const { chain, chains } = useNetwork()

  const { push } = useRouter()

  const handleDisplayName = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const value = input.value
    input.value = value
    setDisplayName(value)
  }

  const FileList: FC<FileListProps> = ({ files, onRemove }) => {
    return (
      <ul className="mt-4 max-h-[190px] max-w-[300px] overflow-y-auto text-[#000000]">
        {files.map((file, index) => (
          <li
            key={`selected-${index}`}
            className="mb-2 mr-2 ml-4 flex items-center"
          >
            <span title={file.name} className="ml-auto block w-full truncate">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={isLoading}
              className="ml-2 rounded px-1 py-0.5 text-sm  text-[#ff0000]"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    )
  }

  const taskAddress = process.env.NEXT_PUBLIC_TASK_ADDRESS

  const handleLink = (
    index: number,
    field: keyof Link,
    valueReceived: string,
  ) => {
    const newLink = [...links]

    if (newLink[index][field].length >= 200) {
      return
    }

    const value = valueReceived

    newLink[index][field] = value
    setLinks(newLink)
  }

  const validSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<VerifiedContributorForm>({
    resolver: yupResolver(validSchema),
  })

  async function handleCreateApplication(
    taskId: number,
    metadata: string,
    budget: Payment[],
  ) {
    console.log('value to be sent')
    console.log(taskId['id'])
    console.log(metadata)
    console.log(budget)
    const { request } = await prepareWriteContract({
      address: `0x${taskAddress.substring(2)}`,
      abi: taskContractABI,
      args: [Number(taskId['id']), metadata, budget],
      functionName: 'applyForTask',
    })
    const { hash } = await writeContract(request)

    const data = await waitForTransaction({
      hash,
    })
    console.log('the data')
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (data.status !== 'success') {
      throw data
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log('fazendo a chamada do file')
      const newFiles = Array.from(event.target.files)
      let validFiles = true
      const allowedMimeTypes = ['image/jpeg', 'image/png']
      const maxFileSize = 10 * 1024 * 1024 // 10 MB

      if (newFiles.length > 1) {
        toast.error(`Only 1 file per task for the MVP.`)
        return
      }

      newFiles.forEach((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
          validFiles = false
          toast.error(`Only JPG, JPEG, PNG allowed for the MVP.`)
          return
        }
        if (file.size > maxFileSize) {
          validFiles = false
          toast.error(`The file ${file.name} is too heavy. Max of 10 MB.`)
          return
        }
        const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 15)
        setSelectedFiles(combinedFiles)
      })
    }
  }
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  async function handleFileUploadIPFS() {
    const file = selectedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    // Configurações do axios para a API Pinata
    const pinataAxios = axios.create({
      baseURL: 'https://api.pinata.cloud/pinning/',
      headers: {
        pinata_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
        pinata_secret_api_key: `${process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    const response = await pinataAxios.post('pinFileToIPFS', formData)

    // O hash é o identificador exclusivo do arquivo no IPFS
    const ipfsHash = response.data.IpfsHash

    console.log('File uploaded to IPFS with hash', ipfsHash)

    return ipfsHash
  }

  // returns a hash to be signed
  function hashObject(obj: any) {
    const str = JSON.stringify(obj)
    const hash = createHash('sha256')
    hash.update(str)
    return hash.digest('hex')
  }

  async function getUser() {
    setIsLoading(true)
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/getUser`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data: { address },
    }

    try {
      await axios(config).then(function (response) {
        setUserProfile(response.data)
        setUpdatesNonce(response.data.updatesNonce)
      })
    } catch (err) {
      toast.error('Error getting the user info!')
      console.log(err)
    }
    setIsLoading(false)
  }

  function loginWithGithub() {
    window.location.assign(
      'https://github.com/login/oauth/authorize?client_id=' +
        process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    )
  }

  async function submitApplication(data: any) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/verifiedContributorSumission`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data,
    }

    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
        console.log(dado)
      }
    })

    return dado
  }

  async function onSubmit(data: VerifiedContributorForm) {
    if (!githubData) {
      toast.error('Please, conect your github account')
      const element = document.getElementById('forms')
      element.scrollIntoView({ behavior: 'smooth' })
    }

    if (chain && chain.name !== 'Polygon Mumbai') {
      toast.error('Please switch chain before interacting with the protocol.')
      return
    }

    setIsApplicationLoading(true)

    const finalData = {
      address,
      description: data.description,
      githubAccessToken: githubData['github_access_token'],
      links: linksValues,
      nonce: updatesNonce || '0',
    }

    // eslint-disable-next-line no-unreachable
    try {
      /* empty */
      // signing the message:
      console.log('data to be hashed')
      console.log(finalData)
      console.log(JSON.stringify(finalData))
      const hash = hashObject(finalData)
      console.log('message to hash')
      console.log(hash)
      const finalHash = `0x${hash}`
      const signature = await signMessage({
        message: finalHash,
      })
      console.log(' mensagem')
      console.log(signature)
      finalData['signature'] = signature
    } catch (err) {
      toast.error('Error during the message signing')
      console.log(err)
      setIsApplicationLoading(false)
      return
    }

    try {
      await submitApplication(finalData)
      toast.success('Application submited succesfully!')
      setIsApplicationLoading(false)
      await new Promise((resolve) => setTimeout(resolve, 2500))
      push(`/profile/${address}`)
    } catch (err) {
      toast.error('Error during the application submited')
      console.log(err)
      setIsApplicationLoading(false)
    }
  }

  async function getGithubData(code: string) {
    const config = {
      method: 'post' as 'post',
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/functions/githubLogin`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      },
      data: { code },
    }

    try {
      await axios(config).then(function (response) {
        console.log('data that received back')
        console.log(response.data)
        setGithubData(response.data)
      })
    } catch (err) {
      toast.error('Error getting the github info!')
      console.log(err)
    }
  }

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const codeParam = urlParams.get('code')
    console.log('my code github')
    console.log(codeParam)

    if (codeParam && !githubData) {
      getGithubData(codeParam)
    }
  }, [])

  useEffect(() => {
    if (address) {
      getUser()
    }
  }, [address])

  if (!address) {
    return (
      <div className="pb-[500px]">
        <div className="mt-[60px] flex items-center justify-center text-[#000000]">
          Connect you wallet to continue
        </div>
        <div className="mt-[20px] flex justify-center text-[14px] text-[#505050]">
          Why do I need to connect my Web3 wallet?
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <section className="px-[100px] pb-[250px] pt-[62px] text-black ">
        <div className="container flex h-60 animate-pulse px-0 pb-12">
          <div className="mr-10 w-3/4 animate-pulse bg-[#dfdfdf]"></div>
          <div className="w-1/4 animate-pulse bg-[#dfdfdf]"></div>
        </div>
        <div className="container h-96 animate-pulse bg-[#dfdfdf] pb-12"></div>
      </section>
    )
  }

  if (
    userProfile &&
    userProfile.VerifiedContributorSubmission.length > 0 &&
    userProfile.VerifiedContributorSubmission[0].status === 'pending'
  ) {
    return (
      <>
        <div id={'forms'}>
          <HeroVerifiedContributor />
        </div>
        <section className="px-[100px] pt-[40px]  pb-[450px]">
          <div className="container px-[0px] text-[16px] font-bold !leading-[19px] text-[#ffffff]">
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
                className=" "
              >
                Pending Approval
              </a>
            </div>{' '}
            <div className="mt-[30px] flex  text-[14px] text-[#505050]">
              Your submition is under revision!
            </div>
          </div>
        </section>
      </>
    )
  }

  if (
    userProfile &&
    userProfile.VerifiedContributorSubmission.length > 0 &&
    userProfile.VerifiedContributorSubmission[0].status === 'approved'
  ) {
    return (
      <>
        <div id={'forms'}>
          <HeroVerifiedContributor />
        </div>
        <section className="px-[100px] pt-[40px]  pb-[450px]">
          <div className="container px-[0px] text-[16px] font-bold !leading-[19px] text-[#ffffff]">
            <div className="flex h-[29px] w-[217px] cursor-pointer items-center  justify-center rounded-[5px] bg-[#12AD50] hover:bg-[#20c964]">
              <img
                src="/images/profile/check.svg"
                alt="image"
                className={`mr-[10px] w-[20px] `}
              />
              <a className=" ">Verified Contributor</a>
            </div>{' '}
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <div id={'forms'}>
        <HeroVerifiedContributor />
      </div>
      <section className="px-[100px] pt-[40px]  pb-[250px]">
        <div className="container px-[0px] text-[14px] font-medium !leading-[19px] text-[#000000]">
          <form>
            <div className="">
              <div className="">
                {githubData ? (
                  <div>
                    <span className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                      Github
                    </span>
                    <div className="mt-[10px] flex">
                      <div className="mr-[10px]">
                        <div className="flex h-[50px] w-[207px] cursor-pointer items-center  justify-center rounded-[10px] border border-[#000000] text-[16px] font-medium text-[#000000] hover:text-[#272626]">
                          <img
                            src={githubData.avatar_url}
                            alt="image"
                            className={`mr-[23px] h-[40px] w-[40px] rounded-[100%] `}
                          />
                          <a className=" ">{githubData.login}</a>
                        </div>{' '}
                      </div>
                      <p
                        onClick={() => {
                          setGithubData(null)
                        }}
                        className="cursor-pointer font-bold text-[#ff0000]"
                      >
                        x
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                      Connect to your account for verification
                    </span>
                    <div
                      onClick={loginWithGithub}
                      className="mt-[10px] flex h-[50px] w-[207px] cursor-pointer items-center justify-center  rounded-[10px] border border-[#000000] p-[5px] text-[16px] font-medium text-[#000000] hover:text-[#272626]"
                    >
                      <img
                        src="/images/profile/github.svg"
                        alt="image"
                        className={`mr-[10px] w-[20px]`}
                      />
                      <a className=" ">Connect to Github</a>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-[30px]">
                <span className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                  Please give us some details about your qualifications to be a
                  Verified Contributor:
                  <p className="ml-[8px] text-[12px] font-normal text-[#ff0000] ">
                    {errors.description?.message}
                  </p>
                </span>
                <textarea
                  disabled={isLoading}
                  style={{ resize: 'none' }}
                  className="mt-[10px] h-[159px] w-[800px] rounded-[10px] border border-[#D4D4D4] bg-white px-[15px] py-[15px] text-[14px] font-normal outline-0"
                  maxLength={2000}
                  placeholder="Type here"
                  {...register('description')}
                />
              </div>

              <div className="mt-[30px]">
                <div className="flex">
                  <span className="flex flex-row text-[14px] font-medium !leading-[17px] text-[#000000]">
                    Additional links that you think may help the team to review
                  </span>
                  <span className="ml-[9px] flex flex-row text-[10px] font-medium !leading-[17px] text-[#505050]">
                    * press "enter" to insert the item
                  </span>
                </div>

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]} // Pode ser um array de opções predefinidas, ou vazio
                  value={linksValues}
                  onChange={(event, newValue) => {
                    setLinksValues(newValue)
                  }}
                  popupIcon={
                    <svg
                      width="16"
                      height="10"
                      viewBox="0 0 16 10"
                      className="mr-[15px] mt-[13px]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.15474 9.65876L0.35261 3.07599C-0.117537 2.62101 -0.117537 1.88529 0.35261 1.43514L1.48296 0.341239C1.95311 -0.113746 2.71335 -0.113746 3.17849 0.341239L8 5.00726L12.8215 0.341239C13.2917 -0.113746 14.0519 -0.113746 14.517 0.341239L15.6474 1.43514C16.1175 1.89013 16.1175 2.62585 15.6474 3.07599L8.84527 9.65876C8.38512 10.1137 7.62488 10.1137 7.15474 9.65876Z"
                        fill="#959595"
                      />
                    </svg>
                  }
                  disabled={isLoading}
                  className="mt-[10px]"
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      id="margin-none"
                      sx={{
                        width: '500px',
                        fieldset: {
                          height: '45px',
                          borderColor: '#D4D4D4',
                          borderRadius: '10px',
                        },
                        input: { color: 'black' },
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-[30px]">
              <button
                type="submit"
                className={`rounded-[10px] bg-[#12AD50] py-[15px] px-[25px] text-[16px] font-bold !leading-[19px]  text-white hover:bg-[#0e7a39] ${
                  isApplicationLoading ? 'bg-[#7deba9] hover:bg-[#7deba9]' : ''
                }`}
                //   disabled={isApplicationLoading}
                onClick={handleSubmit(onSubmit)}
              >
                <span className="">Submit for Review</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default VerifiedContributor
