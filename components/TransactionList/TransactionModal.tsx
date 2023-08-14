import { FormOutlined } from '@ant-design/icons'

const TransactionModal = ({ transaction }) => {
  const iconMap = {
    FormOutlined: <FormOutlined className="align-middle" />,
    // Adicione quaisquer outros ícones que você pode usar aqui
  }

  const truncateHash = (hash) => {
    const start = hash.slice(0, 10)
    const end = hash.slice(-10)
    return `${start}...${end}`
  }

  return (
    <div className="mb-2 ml-4 mr-1 items-start justify-between rounded-md bg-[#121A4D] p-4 text-xs lg:flex lg:text-sm">
      <span>{iconMap[transaction.actionIcon]}</span>
      <span className="ml-1 items-start justify-start lg:mr-2">
        {transaction.actionName}
      </span>
      <div>
        <a
          href={`https://mumbai.polygonscan.com/tx/${transaction.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white line-clamp-1 lg:text-sm"
        >
          {truncateHash(transaction.transactionHash)}
        </a>
      </div>
      <span className="text-[10px] lg:ml-2 lg:text-sm">
        {transaction.transactionDate}
      </span>
    </div>
  )
}

export default TransactionModal
