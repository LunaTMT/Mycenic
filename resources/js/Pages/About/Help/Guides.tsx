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

const guides: SectionGroup[] = [
  {
    heading: 'Guides',
    content: [
      {
        title: '1. Getting Started',
        content:
          'Learn how to begin your mycology journey with our beginner-friendly instructions and essential tools.',
      },
      {
        title: '2. Spore Storage Tips',
        content:
          'Maximize the shelf life of your spores with proper refrigeration and handling techniques.',
      },
      {
        title: '3. Using Our Grow Kits',
        content:
          'Step-by-step instructions on how to set up and use your grow kit for optimal results.',
      },
      {
        title: '4. Agar Culturing Basics',
        content:
          'Understand the fundamentals of agar use in mycology, including recipes and best practices.',
      },
      {
        title: '5. Troubleshooting Contamination',
        content:
          'Identify common signs of contamination and learn effective prevention strategies.',
      },
      {
        title: '6. Safety & Legal Use',
        content:
          'Important legal and safety information about our products and responsible usage.',
      },
    ],
  },
]

export default function Guides() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Help', link: route('about.help.index') },
    { label: 'Guides', link: route('about.help.guides') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Guides" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {guides[0].heading}
        </h1>

        {guides[0].content.map((section, idx) => (
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
