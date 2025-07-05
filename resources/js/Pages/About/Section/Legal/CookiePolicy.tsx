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

const cookiePolicy: SectionGroup = {
  heading: 'Cookie Policy',
  content: [
    {
      title: '1. What Are Cookies?',
      content:
        'Cookies are small text files stored on your device by your web browser when you visit a website. They help websites remember your preferences and enhance your user experience.',
    },
    {
      title: '2. How We Use Cookies',
      content:
        'We use cookies to improve website functionality, analyze site traffic, and personalize content. These cookies help us understand how users interact with our site and where we can improve.',
    },
    {
      title: '3. Types of Cookies We Use',
      content:
        'We use both session cookies, which expire when you close your browser, and persistent cookies, which remain on your device for a set period. These may include essential, performance, functionality, and targeting cookies.',
    },
    {
      title: '4. Managing Your Cookie Preferences',
      content:
        'You can choose to disable or delete cookies through your browser settings. However, some features of our site may not function properly if cookies are disabled.',
    },
    {
      title: '5. Third-Party Cookies',
      content:
        'Some cookies on our site are placed by third-party services such as analytics providers and advertising partners. These third parties may collect information about your online activities over time and across websites.',
    },
    {
      title: '6. Changes to This Cookie Policy',
      content:
        'We may update this cookie policy from time to time to reflect changes in technology, law, or our practices. We encourage you to review this page periodically for any updates.',
    },
  ],
}

export default function CookiePolicy() {
  const { auth } = usePage().props as { auth: { user?: any } }

  const breadcrumbItems = [
    { label: 'Home', link: route('home') },
    { label: 'About', link: route('about.index') },
    { label: 'Legal', link: route('about.legal.index') },
    { label: 'Cookie Policy', link: route('about.legal.cookie-policy') },
  ]

  return (
    <>

    <div className="w-full dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl">
      {cookiePolicy.content.map((section, idx) => (
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
