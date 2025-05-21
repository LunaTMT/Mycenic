import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import GuestLayout from '@/Layouts/GuestLayout'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface SubSection {
  title: string
  content: (string | string[])[]
}

interface Section {
  heading: string
  content: SubSection[]
}

const refundsReturnsData: Section = {
  heading: 'Refunds And Returns',
  content: [
    {
      title: 'Eligibility for Refunds',
      content: [
        'Refunds are only available under the following conditions:',
        [
          'The product is defective or damaged upon arrival',
          'You contact us within 14 days of receiving the product',
          'You provide clear photo evidence of the issue',
        ],
        'We do not offer refunds for change of mind or improper use.',
      ],
    },
    {
      title: 'Return Conditions',
      content: [
        'To be eligible for a return:',
        [
          'The item must be unused and in the original packaging',
          'You must include proof of purchase',
          'Returns must be initiated within 14 days of delivery',
        ],
      ],
    },
    {
      title: 'Non-Returnable Items',
      content: [
        'The following items cannot be returned:',
        [
          'Perishable goods',
          'Items exposed to contamination or improper storage',
          'Digital or downloadable products',
        ],
      ],
    },
    {
      title: 'Refund Process',
      content: [
        'Once we receive and inspect the returned item:',
        [
          'We will notify you via email about the approval or rejection of your refund',
          'If approved, the refund will be processed to your original method of payment within 5–10 business days',
        ],
      ],
    },
    {
      title: 'Return Shipping',
      content: [
        'You are responsible for paying return shipping costs unless the item is faulty or incorrect.',
        'We recommend using a trackable shipping service as we are not responsible for lost return parcels.',
      ],
    },
    {
      title: 'Return Deadline After Approval',
      content: [
        'Once your return is approved and a return label has been issued, you must ship the item back within 7 days.',
        'Returns shipped after this period may not be eligible for a refund.',
      ],
    },
    {
      title: 'Contact for Refunds',
      content: [
        'To request a return or refund, please contact our support team at:',
        ['support@yourdomain.com'],
        'Include your order number and reason for return in your message.',
      ],
    },
  ],
}

export default function RefundsReturns() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Information', link: route('about.information.index') },
    { label: 'Refund | Returns ', link: route('about.information.refunds-and-returns') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Refunds & Returns" />

      <div className="mx-auto min-h-[80vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">{refundsReturnsData.heading}</h1>

        {refundsReturnsData.content.map((subSection, idx) => (
          <div key={idx} className="mb-8">
            <h2
              id={subSection.title.toLowerCase().replace(/\s+/g, '-')}
              className="text-xl font-semibold mb-3 scroll-mt-24 text-gray-800 dark:text-gray-200"
            >
              {subSection.title}
            </h2>
            {subSection.content.map((entry, entryIdx) =>
              typeof entry === 'string' ? (
                <p key={entryIdx} className="mb-2 text-gray-800 dark:text-gray-200">
                  {entry}
                </p>
              ) : (
                <ul key={entryIdx} className="list-disc list-inside pl-4 text-gray-800 dark:text-gray-200 mb-2">
                  {entry.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </div>
        ))}
      </div>
    </Layout>
  )
}
