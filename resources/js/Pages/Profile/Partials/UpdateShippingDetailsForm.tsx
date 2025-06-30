import React, { useState, FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
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

interface User {
  addresses?: Address[];
}

interface PageProps {
  auth: {
    user: User;
  };
}

interface Props {
  className?: string;
}

export default function UpdateShippingDetailsForm({ className = '' }: Props) {
  const { shippingDetails, setShippingDetails } = useCart();

  const { data, setData, processing, errors, reset, setError, clearErrors } =
    useForm<Record<FieldKey, string>>({
      address: '',
      city: '',
      zip: '',
    });

  const page = usePage<PageProps>();
  const user = page.props.auth.user;

  const [addresses, setAddresses] = useState<Address[]>(user.addresses ?? []);
  const [showForm, setShowForm] = useState(false);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    clearErrors();

    try {
      const validation = await axios.post(route('shipping.validate.address'), data);

      if (validation.data.valid) {
        const hasUnconfirmed = validation.data.data?.verdict?.hasUnconfirmedComponents;
        setShippingDetails(data);

        const response = await axios.post(route('profile.addresses.store'), { ...data });

        toast.success(hasUnconfirmed ? 'Address added' : 'Address added.');

        reset();
        setShowForm(false);
        setAddresses((prev) => [...prev, response.data.address]);
      } else {
        toast.error(
          'Invalid address: ' +
            (validation.data.messages?.join(', ') || 'Please check your details.')
        );
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          const validationErrors = error.response.data.errors;
          for (const key in validationErrors) {
            if (validationErrors.hasOwnProperty(key)) {
              setError(key as FieldKey, validationErrors[key][0]);
            }
          }
          toast.error('Please fix the validation errors and try again.');
        } else if (error.response?.status === 409) {
          toast.error(error.response.data.message || 'Address already exists.');
        } else {
          toast.error('Validation failed. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      console.error('Validation error:', error);
    }
  };

  return (
    <section
      className={`rounded-lg w-full h-full shadow-md border dark:border-white/20 border-black/20 ${className}`}
    >
      <div className="rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          
          <h2 className="text-xl font-semibold text-black dark:text-white">Saved Addresses</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center transition bg-yellow-500 text-white   hover:scale-110 duration-300 dark:bg-[#7289da] dark:text-white"
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
                className="p-3 rounded-md border dark:border-white/20 border-black/20"
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {addr.label ?? 'Address'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {addr.address}, {addr.city}, {addr.zip}
                </p>
                {addr.country && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{addr.country}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">No addresses saved.</p>
        )}
      </div>
        
        <h2 className="text-xl pl-4 font-semibold text-black dark:text-white">Add Address</h2>
      {showForm && (
        <div className="rounded-lg p-4">
            
          
          <form
            onSubmit={submit}
            className="rounded-lg shadow-md p-4 space-y-4 border dark:border-white/20 border-black/20"
            noValidate
          >
            

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
                aria-invalid={!!errors.address}
                aria-describedby="address-error"
              />
              <InputError message={errors.address} className="mt-2" id="address-error" />
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
                  aria-invalid={!!errors.city}
                  aria-describedby="city-error"
                />
                <InputError message={errors.city} className="mt-2" id="city-error" />
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
                  aria-invalid={!!errors.zip}
                  aria-describedby="zip-error"
                />
                <InputError message={errors.zip} className="mt-2" id="zip-error" />
              </div>
            </div>

            <PrimaryButton className="rounded-lg" disabled={processing}>
              Add Address
            </PrimaryButton>
          </form>
        </div>
      )}
    </section>
  );
}
