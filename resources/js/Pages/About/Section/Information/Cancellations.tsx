import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface SubSection {
  title: string
  content: (string | string[])[]
}

interface Section {
  heading: string
  content: SubSection[]
}

const cancellationsData: Section = {
  heading: 'Cancellations ',
  content: [
    {
      title: 'Order Cancellation',
      content: [
        'You may request a cancellation within 24 hours of placing your order, provided it has not yet shipped.',
        'To request a cancellation, contact us immediately via the contact form.',
      ],
    },
    {
      title: 'Shipping Costs',
      content: [
        'Shipping costs are non-refundable unless the return is due to our error.',
      ],
    },
    {
      title: 'Chargebacks',
      content: [
        'Initiating a chargeback without contacting us first may result in:',
        [
          'Permanent ban from future purchases',
          'Reporting to payment processors',
        ],
      ],
    },
  ],
}

export default function Cancellations() {
  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Information', link: route('about.information.index') },
    { label: 'Cancellations ', link: route('about.information.cancellations') },
  ]

  return (
    <>
      <Head title="Cancellations & Refunds" />
        <div className="w-full dark:bg-[#424549] p-4">
          {cancellationsData.content.map((subSection, idx) => (
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
                  <ul
                    key={entryIdx}
                    className="list-disc list-inside pl-4 text-gray-800 dark:text-gray-200 mb-2"
                  >
                    {entry.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))}
        </div>
      
    </>
  )
}
