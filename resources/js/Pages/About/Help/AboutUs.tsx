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

const aboutUs: SectionGroup[] = [
  {
    heading: 'About Us',
    content: [
      {
        title: '1. Our Mission',
        content:
          'At Mycenic, our mission is to empower enthusiasts and researchers by providing high-quality mycological products and educational resources.',
      },
      {
        title: '2. Our History',
        content:
          'Founded in 2020, we’ve grown from a small spore distributor to a full-fledged mycology hub offering spores, grow kits, and expert knowledge.',
      },
      {
        title: '3. Meet the Team',
        content:
          'Our team of biologists, hobbyists, and educators work together to ensure you have the best possible experience.',
      },
      {
        title: '4. Our Values',
        content:
          'We are committed to sustainability, scientific rigor, and fostering a responsible mycology community.',
      },
      {
        title: '5. Our Location',
        content:
          'Headquartered in London, UK, we ship worldwide and collaborate with labs and universities globally.',
      },
      {
        title: '6. Careers',
        content:
          'Interested in joining us? Check our careers page or email us at info@example.com for open positions.',
      },
    ],
  },
]

export default function AboutUs() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Help', link: route('about.help.index') },
    { label: 'About Us', link: route('about.help.about-us') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="About Us" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {aboutUs[0].heading}
        </h1>

        {aboutUs[0].content.map((section, idx) => (
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
