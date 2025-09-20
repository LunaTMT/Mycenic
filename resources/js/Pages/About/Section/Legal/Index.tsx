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
  heading: 'Legal',
  content: [
    {
      title: 'Use Policy',
      content:
        'Details our terms of use and acceptable behaviour on the site.',
    },
    {
      title: 'Law Policy',
      content:
        'Explains enforcement, compliance, disclaimers, and liabilities under UK law.',
    },
    {
      title: 'Cookie Policy',
      content:
        'Covers how we use cookies to improve your browsing experience.',
    },
    {
      title: 'Privacy Policy',
      content:
        'Describes what personal data we collect and how we protect it.',
    },
  ],
}

export default function LegalIndex() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Legal', link: route('about.legal.index') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Legal" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5  text-black dark:text-white rounded-lg shadow-md dark:shadow-none">
        <h1 className="text-3xl font-bold mb-6">{section.heading}</h1>

        {section.content.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  )
}
