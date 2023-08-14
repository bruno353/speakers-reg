export type Payment = {
  tokenContract: string
  amount: string
  decimals: number | 18
}

export type Reward = {
  boolean: boolean
  tokenContract: string
  amount: object // {"type": "BigNumber","hex": "0x068155a43676e00000"}
}

export type Link = {
  title: string
  url: string
}

export type ContributorInfo = {
  address: string
}

export type IPFSSubmition = {
  title: string
  description: string
  deadline: Date
  departament: string
  skills: string[]
  type: string
  payments: Payment[]
  links: Link[] | null
  file: string | null
  status: string | null
}

export type Application = {
  metadataDisplayName: string
  applicationId: string
  proposer: string
  reward: Reward[] | []
  applicant: string
  metadataDescription: string
  metadataProposedBudget: string
  timestamp: string
  totalEarned: string | null
  jobSuccess: string | null
  profileImage: string | null
  profileName: string | null
  accepted: boolean
}

export type Submission = {
  id: string
  submissionId: string
  proposer: string
  applicant: string
  metadataDescription: string
  metadataAdditionalLinks: string[]
  accepted: boolean
  timestamp: string
  profileImage: string | null
  profileName: string | null
  reviewed: boolean
}

export type TasksOverview = {
  internalId: string
  proposalId: string
  id: number
  title: string
  description: string
  deadline: string
  daysLeft: string
  metadataEdited: boolean
  budgetIncreased: boolean
  deadlineIncreased: boolean
  departament: string
  isDraft: boolean
  status: string
  links: Link[] | null
  contributorsNeeded: string
  projectLength: string
  skills: string[]
  type: string
  payments: Payment[]
  estimatedBudget: string
  executor: string
  contributors: ContributorInfo[] | null
  Application: Application[] | null
  Submission: Submission[] | null
  updatesCount: number | null
}

export type UserToDraftTask = {
  isVerifiedContributor: boolean
  alreadyVoted: boolean
  voteOption: string | null
  verifiedContributorToken: string | null
}

export type Event = {
  name: string
  transactionHash: string
  address: string
  timestamp: string
}

export type TransactionHistory = {
  actionIcon: string
  actionName: string
  transactionHash: string
  transactionDate: string
  addressSender: string
}

export type TasksPagination = {
  currentPage: number
  totalPages: number
  totalTasks: number
  limit: number
}

export type Contributor = {
  walletAddress: string
  budgetPercentage: number
}

export type TasksCounting = {
  open: number
  active: number
  completed: number
  draft: number
}
