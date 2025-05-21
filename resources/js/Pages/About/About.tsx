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
    heading: 'About',
    content: [
      {
        title: 'Welcome',
        content: `
          Welcome to our platform! We’re thrilled to have you here.

          Our mission is to provide you with high-quality products, helpful information, and an easy, intuitive experience. Whether you're here to learn more, browse our catalog, or get support, we’re committed to serving you with transparency and care.

          Feel free to explore our site and reach out to us anytime. Your journey with us is just beginning, and we’re excited to be a part of it.
        `.trim(),
      },
    ],
  },
]

export default function About() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
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

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5  text-black dark:text-white rounded-lg shadow-md dark:shadow-none">
        <h1 className="text-3xl font-bold mb-6">
          {contactUs[0].heading}
        </h1>

        {contactUs[0].content.map((section, idx) => (
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
