import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import GuestLayout from '@/Layouts/GuestLayout'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface Section {
  title: string
  content: string
}

interface SectionGroup {
  heading: string
  content: Section[]
}

const section: SectionGroup = {
  heading: 'Information',
  content: [
    {
      title: 'Payment Policy',
      content:
        'Details the payment methods accepted, billing processes, and any additional fees.',
    },
    {
      title: 'Shipping & Dispatchment',
      content:
        'Explains our shipping methods, delivery times, and associated costs.',
    },
    {
      title: 'Cancellations',
      content:
        'Outlines the terms and conditions for order cancellations and the process for doing so.',
    },
    {
      title: 'Refunds & Returns',
      content:
        'Describes our refund and return policies, including eligibility and procedures.',
    },
  ],
}

export default function InformationIndex() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Information', link: route('about.information.index') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Information" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {section.heading}
        </h1>

        {section.content.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {section.title}
            </h2>
            <p className="text-gray-800 dark:text-gray-200">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
