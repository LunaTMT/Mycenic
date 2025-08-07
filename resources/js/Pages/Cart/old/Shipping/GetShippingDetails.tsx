import React, { FormEventHandler, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, usePage, router } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import ArrowIcon from '@/Components/Icon/ArrowIcon';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

type FieldKey = 'name' | 'phone' | 'address' | 'city' | 'zip' | 'email';

export default function GetDetails() {
  const { shippingDetails, setShippingDetails } = useCart();
  const { auth } = usePage().props;
  const Layout = auth ? AuthenticatedLayout : GuestLayout;

  // Dropdown open by default
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const { data, setData, processing, errors } = useForm<Record<FieldKey, string>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    email: '',
  });

  useEffect(() => {
    if (Object.values(data).every(v => v === '')) {
      setData({
        name: shippingDetails?.name || auth?.user?.name || '',
        phone: shippingDetails?.phone || '',
        address: shippingDetails?.address || '',
        city: shippingDetails?.city || '',
        zip: shippingDetails?.zip || '',
        email: shippingDetails?.email || auth?.user?.email || '',
      });
    }
  }, [shippingDetails, auth, setData]);

  const hasChanged = () =>
    (Object.keys(data) as FieldKey[]).some(key => data[key] !== (shippingDetails?.[key] || ''));

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!hasChanged()) {
      router.get(route('cart'));
      return;
    }

    try {
      const response = await axios.post(route('shipping.validate.address'), data);
      if (response.data.valid) {
        const dataWithCountry = {
          ...data,
          country: 'GB',
        };
        setShippingDetails(dataWithCountry);
        await axios.post(route('cart.store.shipping.details'), dataWithCountry);
        router.get(route('cart'));
      } else {
        toast.error('Invalid address: ' + (response.data.messages?.join(', ') || 'Please check your details.'));
      }
    } catch {
      toast.error('Validation failed. Please try again.');
    }
  };

  const inputs = [
    { id: 'name', label: 'Name', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'username' },
    { id: 'phone', label: 'Phone (optional)', autoComplete: 'tel' },
    { id: 'address', label: 'Street Address', autoComplete: 'street-address' },
    { id: 'city', label: 'City', autoComplete: 'address-level2', half: true, required: true },
    { id: 'zip', label: 'Postal Code', autoComplete: 'postal-code', half: true, required: true },
  ];

  return (
    <>


      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isDropdownOpen ? 'auto' : 0, opacity: isDropdownOpen ? 1 : 0 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className=""
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          {inputs.slice(0, 4).map(({ id, label, ...rest }) => (
            <div key={id}>
              <InputLabel htmlFor={id} value={label} />
              <TextInput
                id={id}
                name={id}
                type={(rest as any).type || 'text'}
                value={data[id as FieldKey]}
                onChange={e => setData(id as FieldKey, e.target.value)}
                className="mt-1 w-full"
                {...rest}
              />
              <InputError message={errors[id as FieldKey]} className="mt-2" />
            </div>
          ))}

          <div className="flex gap-4">
            {inputs.slice(4).map(({ id, label, required, ...rest }) => (
              <div key={id} className="w-1/2">
                <InputLabel htmlFor={id} value={label} />
                <TextInput
                  id={id}
                  name={id}
                  value={data[id as FieldKey]}
                  onChange={e => setData(id as FieldKey, e.target.value)}
                  className="mt-1 w-full"
                  required={required}
                  {...rest}
                />
                <InputError message={errors[id as FieldKey]} className="mt-2" />
              </div>
            ))}
          </div>

          <PrimaryButton className="w-full " disabled={processing}>
            Set Address
          </PrimaryButton>
        </form>
      </motion.div>
    </>
  );
}
