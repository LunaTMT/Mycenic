import React, { FormEventHandler, useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

type FieldKey = 'address' | 'city' | 'zip';

interface Address {
  id: number;
  label?: string;
  address: string;
  city: string;
  zip: string;
  country?: string;
  created_at?: string;
}

interface Props {
  className?: string;
}

export default function UpdateShippingDetailsForm({ className = '' }: Props) {
  const { shippingDetails, setShippingDetails } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);

  const { data, setData, processing, errors, reset } = useForm<Record<FieldKey, string>>({
    address: '',
    city: '',
    zip: '',
  });

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(route('profile.shipping-details'));
      setAddresses(response.data.addresses || []);
    } catch {
      toast.error('Failed to load addresses.');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();

    try {
      const validation = await axios.post(route('shipping.validate.address'), data);
      console.log('Validation response:', validation.data);

      if (validation.data.valid) {
        const hasUnconfirmed = validation.data.data?.verdict?.hasUnconfirmedComponents;

        setShippingDetails(data);

        await axios.post(route('profile.addresses.store'), { ...data });

        if (hasUnconfirmed) {
          toast.warn('Address added, but some parts may be unconfirmed.');
        } else {
          toast.success('Address added.');
        }

        reset();
        fetchAddresses();
        setShowForm(false);
      } else {
        toast.error(
          'Invalid address: ' +
          (validation.data.messages?.join(', ') || 'Please check your details.')
        );
      }
    } catch (error) {
      toast.error('Validation failed. Please try again.');
      console.error('Validation error:', error);
    }
  };

  return (
    <section className={`rounded-lg w-full h-full shadow-md dark:border-white/20 border border-black/20 p-4 ${className}`}>
      <div className="rounded-lg shadow-md border dark:border-white/20 border-black/20 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">Saved Addresses</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`
              text-2xl font-bold
              rounded-full w-8 h-8 flex items-center justify-center
              transition
              bg-yellow-500 text-yellow-900 border border-yellow-600
              hover:scale-110 duration-300 
              dark:bg-[#7289da] dark:text-white dark:border-[#4a5fb3]
            `}
            aria-label={showForm ? 'Hide add address form' : 'Show add address form'}
          >
            {showForm ? '−' : '+'}
          </button>
        </div>

        {addresses.length > 0 ? (
          <ul className="space-y-2">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="p-3 bg-gray-100 dark:bg-[#444] rounded-md border border-gray-300 dark:border-gray-600"
              >
                <p className="font-medium">{addr.label ?? 'Address'}</p>
                <p>{addr.address}, {addr.city}, {addr.zip}</p>
                {addr.country && <p className="text-sm text-gray-500">{addr.country}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">No addresses saved.</p>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="rounded-lg shadow-md border dark:border-white/20 border-black/20 p-4 space-y-4"
        >
          <h2 className="text-xl font-semibold text-black dark:text-white">Add New Address</h2>

          <div>
            <InputLabel htmlFor="address" value="Street Address" />
            <TextInput
              id="address"
              name="address"
              type="text"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              className="mt-1 w-full"
              autoComplete="street-address"
              required
            />
            <InputError message={errors.address} className="mt-2" />
          </div>

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

          <PrimaryButton className="rounded-lg" disabled={processing}>
            Add Address
          </PrimaryButton>
        </form>
      )}
    </section>
  );
}
