import React, { FormEventHandler, useEffect, useRef } from 'react';
import { useForm, Head, usePage, router } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';

import Breadcrumb from '@/Components/Nav/Breadcrumb';
import { useCart } from '@/Contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

type FieldKey = 'name' | 'phone' | 'address' | 'city' | 'zip' | 'email';

export default function GetDetails() {
  const { shippingDetails, setShippingDetails } = useCart();
  const { auth } = usePage().props;

  const videoRef = useRef<HTMLVideoElement>(null);
  const Layout = auth ? AuthenticatedLayout : GuestLayout;

  // Initialize empty form data here, will set below in useEffect
  const { data, setData, post, processing, errors } = useForm<Record<FieldKey, string>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    email: '',
  });

  useEffect(() => {
    // Only populate form if currently empty to avoid overwriting user edits
    const isEmptyForm = (Object.values(data).every((v) => v === ''));

    if (isEmptyForm) {
      if (shippingDetails) {
        setData({
          name: shippingDetails.name || '',
          phone: shippingDetails.phone || '',
          address: shippingDetails.address || '',
          city: shippingDetails.city || '',
          zip: shippingDetails.zip || '',
          email: shippingDetails.email || '',
        });
      } else if (auth?.user) {
        setData({
          name: auth.user.name || '',
          phone: '', // phone may not exist on user, so empty fallback
          address: '',
          city: '',
          zip: '',
          email: auth.user.email || '',
        });
      }
    }
  }, [shippingDetails, auth, setData]);

  const hasChanged = () => {
    return (Object.keys(data) as FieldKey[]).some((key) => data[key] !== (shippingDetails?.[key] || ''));
  };

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();

    // If data has not changed, skip validation and go back to cart
    if (!hasChanged()) {
      router.get(route('cart'));
      return;
    }

    try {
      const response = await axios.post(route('shipping.validate.address'), data);

      if (response.data.valid) {
        setShippingDetails(data);
        await axios.post(route('cart.store.shipping.details'), data);
        router.get(route('cart'));
      } else {
        toast.error(
          'Invalid address: ' +
            (response.data.messages?.join(', ') || 'Please check your details.')
        );
      }
    } catch (error) {
      toast.error('Validation failed. Please try again.');
      console.error('Validation error:', error);
    }
  };

  return (
    <Layout
      header={
        <div className="h-[5vh] w-full flex items-center justify-center">
          <Breadcrumb
            items={[
              { label: 'SHOP', link: route('home') },
              { label: 'CART', link: route('cart') },
              { label: 'GET SHIPPING DETAILS' },
            ]}
          />
        </div>
      }
    >
      <Head title="Shipping Details" />

      <div className="relative flex justify-center items-center h-[89vh] w-full px-4 sm:px-6 lg:px-8">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Centered form */}
        <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <form onSubmit={submit} className="p-8 flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">
              GET SHIPPING DETAILS
            </h2>

            {/* Inputs */}
            {[
              { id: 'name', label: 'Name', autoComplete: 'name' },
              { id: 'email', label: 'Email', type: 'email', autoComplete: 'username' },
              { id: 'phone', label: 'Phone (optional)', autoComplete: 'tel' },
              { id: 'address', label: 'Street Address', autoComplete: 'street-address' },
            ].map(({ id, label, ...rest }) => (
              <div key={id}>
                <InputLabel htmlFor={id} value={label} />
                <TextInput
                  id={id}
                  name={id}
                  type={(rest as any).type || 'text'}
                  value={data[id as FieldKey]}
                  onChange={(e) => setData(id as FieldKey, e.target.value)}
                  className="mt-1 w-full"
                  {...rest}
                />
                <InputError message={errors[id as FieldKey]} className="mt-2" />
              </div>
            ))}

            {/* City & Postal side by side */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <InputLabel htmlFor="city" value="City" />
                <TextInput
                  id="city"
                  name="city"
                  value={data.city}
                  onChange={(e) => setData('city', e.target.value)}
                  className="mt-1 w-full"
                  autoComplete="address-level2"
                  required
                />
                <InputError message={errors.city} className="mt-2" />
              </div>
              <div className="w-1/2">
                <InputLabel htmlFor="zip" value="Postal Code" />
                <TextInput
                  id="zip"
                  name="zip"
                  value={data.zip}
                  onChange={(e) => setData('zip', e.target.value)}
                  className="mt-1 w-full"
                  autoComplete="postal-code"
                  required
                />
                <InputError message={errors.zip} className="mt-2" />
              </div>
            </div>

            <PrimaryButton className="w-full mt-4" disabled={processing}>
              Continue to Cart
            </PrimaryButton>
          </form>
        </div>
      </div>
    </Layout>
  );
}
