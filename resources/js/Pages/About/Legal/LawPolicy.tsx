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

const lawPolicyData: Section = {
  heading: 'Law Policy',
  content: [
    {
      title: 'Enforcement',
      content: [
        'We reserve the right to:',
        [
          'Monitor usage',
          'Investigate violations',
          'Suspend or terminate access to our services',
          'Report illegal activity to UK authorities',
        ],
      ],
    },
    {
      title: 'Compliance with UK Law',
      content: [
        'You agree to use our services in full compliance with:',
        [
          'Applicable UK laws',
          'Any legal restrictions in your local jurisdiction',
        ],
        'By purchasing, you confirm that the use of our products is legal where you reside.',
      ],
    },
    {
      title: 'Disclaimer of Warranties',
      content: [
        'Our site and services are provided “as is” without any warranties.',
        'We do not guarantee:',
        [
          'Error-free operation',
          'Continuous availability',
          'Legal compliance in your jurisdiction',
        ],
      ],
    },
    {
      title: 'Limitation of Liability',
      content: [
        'We are not liable for any damages arising from:',
        [
          'Use or misuse of our site or services',
          'Legal consequences of unlawful actions involving our products',
        ],
      ],
    },
    {
      title: 'Indemnity',
      content: [
        'You agree to indemnify and hold harmless our company from any claims or damages arising from:',
        [
          'Your use of the site',
          'Your violation of these Terms',
          'Illegal or unauthorized activities involving our products',
        ],
      ],
    },
    {
      title: 'Changes to Terms',
      content: [
        'We may update these Terms of Use at any time.',
        'Continued use of the site after changes constitutes acceptance of the new terms.',
      ],
    },
    {
      title: 'Termination',
      content: [
        'We may suspend or terminate your access to the site or services for any reason, including violation of these Terms, with or without notice.',
      ],
    },
    {
      title: 'Contact and Communications',
      content: [
        'When contacting us, you must not:',
        [
          'Ask about cultivation or illegal use',
          'Mention any unlawful activity',
        ],
        'Doing so will result in:',
        [
          'Immediate banning of your account',
          'Termination of communication',
          'Possible reporting to legal authorities',
        ],
      ],
    },
    {
      title: 'Governing Law',
      content: [
        'These Terms are governed by the laws of the United Kingdom.',
        'Any legal disputes must be brought exclusively in UK courts.',
      ],
    },
  ],
}

export default function LawPolicy() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Legal', link: route('about.legal.index') },
    { label: 'Law Policy', link: route('about.legal.law-policy') },
  ]

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="Law" />

      <div className="mx-auto min-h-[89vh] max-w-7xl sm:px-6 lg:px-8 p-5 text-black dark:text-white rounded-lg shadow-md dark:shadow-none">
        <h1 className="text-3xl font-bold mb-6">{lawPolicyData.heading}</h1>

        {lawPolicyData.content.map((subSection, idx) => (
          <div key={idx} className="mb-8">
            <h2
              id={subSection.title.toLowerCase().replace(/\s+/g, '-')}
              className="text-xl font-semibold mb-3 scroll-mt-24"
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
