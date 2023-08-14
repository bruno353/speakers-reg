'use client'
// import { useState } from 'react'
import DepartamentModal from './DepartamentModal'

const DepartamentsList = () => {
  const transactions = [
    {
      id: 1,
      title: 'Data and analytics',
      paragraph:
        'Data warehousing, normalisation, collecting, analyzing, and interpreting data to derive meaningful insights.',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      budget: [
        { amount: '500', token: 'USDC' },
        { amount: '50', token: 'USDT' },
      ],
      tasks: [
        { id: 1, title: 'Amazon SageMaker optimisation' },
        { id: 2, title: 'Smart-contract development' },
        { id: 3, title: 'Defi Farm' },
        { id: 4, title: 'Apache Kafka' },
        { id: 5, title: 'EC2 config' },
        { id: 6, title: 'GCP MPC congif' },
      ],
    },
    {
      id: 2,
      title: 'Smart-contracts and DLTs',
      paragraph:
        'Developing and implementing consensus mechanisms, responsible for DAO functions, integrations with smart contracts and public chains',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      budget: [
        { amount: '1200', token: 'LINK' },
        { amount: '50', token: 'USDT' },
      ],
      tasks: [
        { id: 1, title: 'Amazon SageMaker optimisation' },
        { id: 2, title: 'Smart-contract development' },
        { id: 3, title: 'Defi Farm' },
        { id: 4, title: 'Apache Kafka' },
        { id: 5, title: 'EC2 config' },
        { id: 6, title: 'GCP MPC congif' },
      ],
    },
    {
      id: 3,
      title: 'Cloud, DevOps & infrastructure',
      paragraph:
        'Managing the infrastructure and maintaining IaaS core services, optimize the infrastructure to enhance performance, reliability, and security',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      budget: [
        { amount: '500', token: 'USDC' },
        { amount: '25', token: 'USDT' },
      ],
      tasks: [
        { id: 1, title: 'Amazon SageMaker optimisation' },
        { id: 2, title: 'Smart-contract development' },
        { id: 3, title: 'Defi Farm' },
        { id: 4, title: 'Apache Kafka' },
        { id: 5, title: 'EC2 config' },
        { id: 6, title: 'GCP MPC congif' },
      ],
    },
    {
      id: 4,
      title: 'Admin, HR & Operations',
      paragraph:
        'Oversee operations, budgeting, manage human resources, administration, and logistics to ensure the smooth functioning of the operation.',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      budget: [
        { amount: '500', token: 'USDC' },
        { amount: '50', token: 'USDT' },
      ],
      tasks: [
        { id: 1, title: 'Amazon SageMaker optimisation' },
        { id: 2, title: 'Smart-contract development' },
        { id: 3, title: 'Defi Farm' },
        { id: 4, title: 'Apache Kafka' },
        { id: 5, title: 'EC2 config' },
        { id: 6, title: 'GCP MPC congif' },
      ],
    },
  ]

  return (
    <section className="px-32 pb-16 md:pb-20 lg:pb-40">
      <div className="container">
        <div className="my-4 mx-auto items-center justify-center py-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {transactions.map((transaction) => (
              <DepartamentModal
                key={transaction.id}
                departament={transaction}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DepartamentsList
