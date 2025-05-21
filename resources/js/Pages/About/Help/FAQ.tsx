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

const faq: SectionGroup[] = [
  {
    heading: 'Frequently Asked Questions',
    content: [
      {
        title: '1. What payment methods do you accept?',
        content:
          'We accept Visa, MasterCard, American Express, and PayPal. All payments are processed securely through Stripe.',
      },
      {
        title: '2. How long does shipping take?',
        content:
          'Standard UK shipping takes 3-5 business days. International shipping times vary by destination.',
      },
      {
        title: '3. What is your return policy?',
        content:
          'You can return unopened products within 30 days for a full refund. Please contact support@example.com to initiate a return.',
      },
      {
        title: '4. How can I track my order?',
        content:
          'Once your order ships, you will receive a tracking number via email. Use it on the carrier’s website to track delivery status.',
      },
      {
        title: '5. Do I need an account to place an order?',
        content:
          'Creating an account is optional but allows you to save shipping details and view order history more easily.',
      },
      {
        title: '6. Can I change my order after placing it?',
        content:
          'If your order has not shipped yet, email support@example.com and we’ll do our best to accommodate changes.',
      },
    ],
  },
]

export default function Faq() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Help', link: route('about.help.index') },
    { label: 'FAQ', link: route('about.help.faq') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="FAQ" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {faq[0].heading}
        </h1>

        {faq[0].content.map((section, idx) => (
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
