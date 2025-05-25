import React from 'react'
import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Breadcrumb from '@/Components/Nav/Breadcrumb'
import { useCart } from '@/Contexts/CartContext'
import StepNavigator from './StepNavigator'
import ReturnItemTable from './ReturnItemTable'
import { ReturnProvider, useReturn } from '@/Contexts/ReturnContext'

interface ReturnInstructionsProps {
  auth: any
  orderId: string
  items: {
    id?: number
    name: string
    quantity: number
    image?: string
    price: number // required
    weight: number // required
  }[]
  returnLabelUrl: string
  returnStatus: 'label_generated' | 'in_transit' | 'received' | 'refunded'
  supportEmail: string
}


export default function ReturnInstructions({
  orderId,
  items,
  returnLabelUrl,
}: ReturnInstructionsProps) {
  
//orderId={orderId} returnLabelUrl={returnLabelUrl} fromAddress={shippingDetails}

  return (
    <ReturnProvider
        initialItems={items}
        orderID={orderId}
        returnLabelUrl={returnLabelUrl}
      >

      <AuthenticatedLayout
        header={
          <div className="h-[5vh] z-10 w-full flex justify-between items-center">
            <Breadcrumb
              items={[
                { label: 'ACCOUNT' },
                { label: 'ORDERS', link: route('orders.index') },
                { label: `#${orderId}` },
                { label: 'RETURNS' },
              ]}
            />
          </div>
        }
      >
        <Head title="Return Instructions" />
        <Content  />
      </AuthenticatedLayout>
    </ReturnProvider>
  )
}

function Content({

}: {

}) {


  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto dark:text-gray-300 flex gap-5 justify-center items-start font-Poppins">
      {/* Background video */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 text-gray-900 dark:text-gray-300 font-Poppins">
        <ReturnItemTable />
        <StepNavigator />
      </div>
    </div>
  )
}
