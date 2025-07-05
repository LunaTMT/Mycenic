import React from 'react'
import { usePage } from '@inertiajs/react'
import Breadcrumb from '@/Components/Nav/Breadcrumb'

interface Section {
  title: string
  content: string
}

interface SectionGroup {
  heading: string
  content: Section[]
}

const privacyPolicy: SectionGroup = {
  heading: 'Privacy Policy',
  content: [
    {
      title: '1. Information We Collect',
      content:
        'We may collect personal information such as your name, email address, and payment details when you interact with our website. This is used to provide services and improve your user experience.',
    },
    {
      title: '2. How We Use Your Information',
      content:
        'We use the information we collect to process orders, improve our services, and communicate with you regarding your account or purchases.',
    },
    {
      title: '3. Data Protection',
      content:
        'We take reasonable steps to protect your personal information and ensure it is stored securely. However, no method of transmission over the internet is 100% secure.',
    },
    {
      title: '4. Sharing Your Information',
      content:
        'We do not sell, trade, or rent your personal information to third parties. However, we may share information with trusted service providers who assist us in operating our website or processing transactions.',
    },
    {
      title: '5. Your Rights',
      content:
        'You have the right to access, correct, or delete your personal information. You may also opt-out of receiving promotional communications from us.',
    },
    {
      title: '6. Changes to This Privacy Policy',
      content:
        'We reserve the right to modify this privacy policy at any time. Any changes will be posted on this page and will take effect immediately.',
    },
  ],
}

export default function PrivacyPolicy() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Legal', link: route('about.legal.index') },
    { label: 'Privacy Policy', link: route('about.legal.privacy-policy') },
  ]

  return (
    <>
    <div className="w-full dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl">
      {privacyPolicy.content.map((section, idx) => (
        <section key={idx} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {section.title}
          </h2>
          <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
        </section>
      ))}
      </div>
    </>
  )
}
