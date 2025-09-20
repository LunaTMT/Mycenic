import React from 'react'
import { Head } from '@inertiajs/react'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface SubSection {
  title: string
  content: (string | string[])[]
}

interface Section {
  heading: string
  content: SubSection[]
}

const shippingDispatchmentData: Section = {
  heading: 'Shipping And Dispatchment',
  content: [
    {
      title: 'Processing Times',
      content: [
        'Orders are typically processed within 1–3 business days.',
        'Delays may occur during peak periods or due to unforeseen circumstances.',
      ],
    },
    {
      title: 'Shipping Methods',
      content: [
        'We offer the following shipping methods:',
        [
          'Royal Mail First Class',
          'Royal Mail Tracked 24/48',
          'Courier for larger parcels (e.g., DPD or Evri)',
        ],
        'Shipping method availability may vary based on your location.',
      ],
    },
    {
      title: 'Shipping Destinations',
      content: [
        'We currently ship within the United Kingdom.',
        'International shipping is not available at this time.',
      ],
    },
    {
      title: 'Dispatch Notifications',
      content: [
        'You will receive a confirmation email once your order is dispatched.',
        'Tracking information will be included if applicable.',
      ],
    },
    {
      title: 'Failed Deliveries',
      content: [
        'If a package is returned due to an incorrect address or failed delivery attempt:',
        [
          'We may charge additional shipping fees for resending',
          'Unclaimed packages may be refunded minus the original shipping cost',
        ],
      ],
    },
    {
      title: 'Shipping Delays',
      content: [
        'We are not responsible for delays caused by:',
        [
          'Postal strikes',
          'Weather conditions',
          'Customs checks (where applicable)',
        ],
        'We will do our best to keep you informed of any delays.',
      ],
    },
    {
      title: 'Contact Us',
      content: [
        'For any shipping-related inquiries, contact our support team via the contact form.',
      ],
    },
  ],
}

export default function ShippingDispatchment() {
  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Information', link: route('about.information.index') },
    { label: 'Shipping | Dispatchment ', link: route('about.information.shipping-and-dispatchment') },
  ]

  return (
    <>
      <Head title="Shipping & Dispatchment" />
      <div className="w-full dark:bg-[#424549] p-4">
        {shippingDispatchmentData.content.map((subSection, idx) => (
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
    </>
  )
}
