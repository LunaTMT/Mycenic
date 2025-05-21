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
  heading: 'Help',
  content: [
    {
      title: '',
      content: 'Find answers to common questions and solutions to common issues.',
    },
    {
      title: '1. Guides',
      content: 'Step-by-step guides to help you use our services effectively.',
    },
    {
      title: '2. FAQ',
      content: 'Frequently asked questions and their answers to help you get started.',
    },
    {
      title: '3. About Us',
      content: 'Learn more about our mission, values, and the team behind the site.',
    },
    {
      title: '4. Contact Us',
      content: 'Get in touch with our support team for any inquiries or issues.',
    },
  ],
}

export default function HelpIndex() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Help', link: route('about.legal.index') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Help" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {section.heading}
        </h1>

        {section.content.map((section, idx) => (
          <div key={idx} className="mb-6">
            {section.title && (
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
            )}
            <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
