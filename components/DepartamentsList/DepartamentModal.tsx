/* eslint-disable no-unused-vars */
import { FormOutlined } from '@ant-design/icons'
import Image from 'next/image'
import Link from 'next/link'

const DepartamentModal = ({ departament }) => {
  const { title, paragraph, tasks, categories, budget } = departament

  const iconMap = {
    FormOutlined: <FormOutlined className="align-middle" />,
    // Adicione quaisquer outros ícones que você pode usar aqui
  }
  const logoMapping = {
    USDC: '/images/tokens/usd-coin-usdc-logo.svg',
    USDT: '/images/tokens/tether-usdt-logo.svg',
    LINK: '/images/tokens/chainlink-link-logo.svg',
    ERC20: '/images/tokens/generic-erc20.svg',
  }
  return (
    <div className="border border-[#e2e2e2] px-8 py-10 text-[#000000] shadow-2xl">
      <div>
        <h3 className="mb-2 text-xl font-bold text-[#000000] sm:text-2xl lg:text-xl xl:text-2xl">
          {title}
        </h3>
        <p className="pr-[10px] text-sm font-normal !leading-tight text-[#595959]">
          {paragraph}
        </p>
        <div className="mb-2 flex space-x-2">
          {categories.map((category, index) => (
            <span
              key={index}
              className="mt-4 rounded-md bg-[#01E2AC] px-2 py-1 text-[9px] font-bold text-[#000000]"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="mb-2 mt-5 pb-2 font-medium">
          <h1 className="border-b border-[#e2e2e2]">Latest tasks</h1>
          {tasks.map((task, index) => (
            <div key={index}>
              <Link
                href={`/task/${task.id}`}
                className="text-sm font-light text-[#000000] hover:text-primary"
              >
                - {task.title}
              </Link>
            </div>
          ))}
        </div>
        <div className="mb-2 flex w-1/2 space-x-2">
          {budget.map((budget, index) => (
            <div
              key={index}
              className="mt-4 flex items-start justify-start  px-2 py-1"
            >
              <img
                src={logoMapping[budget.token]}
                alt="image"
                className={`w-[25px] ${
                  budget.token === 'USDT' ? 'mt-1' : 'mt-0'
                }`}
              />
              <span className="ml-1 text-base font-bold text-[#000000]">
                {budget.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DepartamentModal
