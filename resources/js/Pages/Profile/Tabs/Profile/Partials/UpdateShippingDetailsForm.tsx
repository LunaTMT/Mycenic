import React, { useState, FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useShipping } from '@/Contexts/Shop/Cart/ShippingContext';

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
  const { shippingDetails, setShippingDetails } = useShipping();

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Null-safe check if address is selected
  const isSelectedAddress = (addr: Address) => {
    const current = shippingDetails ?? { address: '', city: '', zip: '' };
    return (
      current.address === addr.address &&
      current.city === addr.city &&
      current.zip === addr.zip
    );
  };

  const handleSelectAddress = (addr: Address) => {
    setShippingDetails({
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
    });
  };

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
      className={`rounded-lg w-full h-full shadow-md border dark:border-white/20 border-black/20 overflow-hidden ${className}`}
    >
      <div className="rounded-lg p-4 flex gap-6 items-start overflow-visible ">
        {/* Saved Addresses List */}
        <div className=" w-1/2 h-full overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">Saved Addresses</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center transition bg-yellow-500 text-white  duration-300 dark:bg-[#7289da] dark:text-white"
              aria-label={showForm ? 'Hide add address form' : 'Show add address form'}
            >
              {showForm ? '−' : '+'}
            </button>
          </div>

          {addresses.length > 0 ? (
            <ul className="space-y-2">
              {addresses.map((addr) => {
                const selected = isSelectedAddress(addr);
                const hovered = hoveredId === addr.id;
                return (
                  <li
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    onMouseEnter={() => setHoveredId(addr.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`relative cursor-pointer p-3 rounded-md border dark:border-white/20 border-black/20
                      transition
                      ${
                        selected
                          ? 'bg-green-500/20 dark:bg-green-600/30'
                          : hovered
                          ? 'bg-green-200/10 dark:bg-green-700/20'
                          : ''
                      }
                      `}
                    title={
                      selected
                        ? 'Selected address'
                        : 'Click to select this address'
                    }
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

                    {/* Tick icon bottom-right if hovered or selected */}
                    {(selected || hovered) && (
                      <span
                        className="absolute bottom-2 right-2 text-green-600 dark:text-green-400"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No addresses saved.</p>
          )}
        </div>

        {/* Add Address Form */}
        {showForm && (
          <div className="flex-1 rounded-lg p-4 shadow-md border dark:border-white/20 border-black/20 ">
            <form onSubmit={submit} noValidate className="space-y-4">
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
      </div>
    </section>
  );
}
