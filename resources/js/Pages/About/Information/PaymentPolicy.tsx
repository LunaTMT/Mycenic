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

const paymentPolicyData: Section = {
  heading: 'Payment Policy',
  content: [
    {
      title: 'Accepted Payment Methods',
      content: [
        'We accept the following payment methods:',
        [
          'Visa, Mastercard, American Express',
          'Apple Pay, Google Pay',
          'Stripe-secured credit/debit transactions',
        ],
      ],
    },
    {
      title: 'Billing Information',
      content: [
        'You agree to provide current, complete, and accurate billing information.',
        'Failure to provide accurate information may result in order delays or cancellation.',
      ],
    },
    {
      title: 'Payment Authorization',
      content: [
        'By submitting payment information, you authorize us to charge the full order amount.',
        'All transactions are subject to validation and authorization by your payment provider.',
      ],
    },
    {
      title: 'Failed Transactions',
      content: [
        'If your transaction is declined or fails:',
        [
          'Your order will not be processed',
          'You may be notified to update payment details',
        ],
      ],
    },
    {
      title: 'Refund Policy',
      content: [
        'All sales are final unless otherwise stated.',
        'Refunds may be granted only under exceptional circumstances at our discretion.',
        'We reserve the right to deny refund requests in cases involving misuse or violation of our Terms.',
      ],
    },
    {
      title: 'Chargebacks and Disputes',
      content: [
        'Initiating a chargeback without contacting us first may result in:',
        [
          'Immediate account suspension',
          'Ban from future purchases',
          'Reporting to payment processors or authorities if fraud is suspected',
        ],
      ],
    },
    {
      title: 'Currency and Taxes',
      content: [
        'All transactions are processed in GBP (£) unless otherwise specified.',
        'You are responsible for any applicable local taxes, duties, or conversion fees.',
      ],
    },
    {
      title: 'Updates to Payment Terms',
      content: [
        'We reserve the right to change our payment terms at any time.',
        'Continued use of the site after changes indicates acceptance of the new terms.',
      ],
    },
  ],
}

export default function PaymentPolicy() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Information', link: route('about.information.index') },  // Update this line
    { label: 'Payment Policy', link: route('about.information.payment-policy') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Payment" />

      <div className="mx-auto min-h-[80vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {paymentPolicyData.heading}
        </h1>

        {paymentPolicyData.content.map((subSection, idx) => (
          <div key={idx} className="mb-8">
            <h2
              id={subSection.title.toLowerCase().replace(/\s+/g, '-')}
              className="text-xl font-semibold mb-3 scroll-mt-24 text-gray-900 dark:text-gray-100"
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
    </Layout>
  )
}
