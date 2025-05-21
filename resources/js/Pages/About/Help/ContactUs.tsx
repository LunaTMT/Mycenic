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

const contactUs: SectionGroup[] = [
  {
    heading: 'Contact Us',
    content: [
      {
        title: '1. Customer Support',
        content:
          'Our dedicated customer support team is available Monday to Friday, 9am to 6pm GMT to assist you with any queries or issues.',
      },
      {
        title: '2. Email Us',
        content:
          'You can reach our support via email at support@example.com. We aim to respond within 24 hours.',
      },
      {
        title: '3. Call Us',
        content:
          'For immediate assistance, call us at +44 (0)20 1234 5678 during business hours.',
      },
      {
        title: '4. Live Chat',
        content:
          'Click the chat icon at the bottom right of your screen to start a live chat with our agents.',
      },
      {
        title: '5. Visit Us',
        content:
          'Our head office is located at 123 Mycenic Lane, London, UK. Visits are by appointment only.',
      },
      {
        title: '6. Feedback',
        content:
          'We value your feedback. Please share your thoughts via feedback@example.com.',
      },
    ],
  },
]

export default function ContactUs() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Help', link: route('about.help.index') },
    { label: 'Contact Us', link: route('about.help.contact-us') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Contact Us" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {contactUs[0].heading}
        </h1>

        {contactUs[0].content.map((section, idx) => (
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
