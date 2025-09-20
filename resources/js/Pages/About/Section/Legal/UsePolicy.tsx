import React from 'react'
import { usePage } from '@inertiajs/react'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface SubSection {
  title: string
  content: (string | string[])[]
}

interface Section {
  heading: string
  content: SubSection[]
}

const usePolicyData: Section = {
  heading: 'Use Policy',
  content: [
    {
      title: '1. Overview',
      content: [
        'These Terms of Use govern your access to and use of our website, services, and products.',
        'By accessing or using the site, you agree to be legally bound by these Terms.',
      ],
    },
    {
      title: '2. Services',
      content: [
        'You must not use our services to engage in illegal, harmful, or abusive activities, including but not limited to:',
        [
          'Distributing malware or viruses',
          'Phishing or harvesting personal data',
          'Engaging in harassment or threats',
          'Spamming or unsolicited promotions',
          'Infringing intellectual property rights',
        ],
      ],
    },
    {
      title: '3. Prohibited Cultivation',
      content: [
        'Our spore syringes and grow kits are sold strictly for legal purposes such as microscopy, taxonomy, or educational research.',
        'Cultivation of psilocybin mushrooms or any controlled substance is prohibited where unlawful.',
        'Any mention of cultivation or illegal use will result in:',
        [
          'Immediate banning of your account',
          'Termination of all communications',
          'Potential reporting to UK authorities',
        ],
      ],
    },
  ],
}

export default function UsePolicy() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Legal', link: route('about.legal.index') },
    { label: 'Use Policy', link: route('about.legal.use-policy') },
  ]

  return (
    <>
      <div className="w-full dark:bg-[#424549] p-4">
      {usePolicyData.content.map((section, idx) => (
        <section key={idx} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {section.title}
          </h2>
          {section.content.map((entry, entryIdx) =>
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
        </section>
      ))}
      </div>
    </>
  )
}
