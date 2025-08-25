import React, { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import { countries, countriesWithStates } from '@/utils/countries';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import { ShippingDetail } from '@/types/Shipping';

// Type for form fields
type FieldKey =
  | 'full_name'
  | 'email'
  | 'phone'
  | 'country'
  | 'address_line1'
  | 'address_line2'
  | 'city'
  | 'state'
  | 'zip';

const FormInput = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  label,
  error,
  required = false,
  autoComplete = '',
}: {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  label: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}) => (
  <div>
    <InputLabel htmlFor={id} value={label} />
    <TextInput
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 w-full"
      required={required}
      autoComplete={autoComplete}
    />
    <InputError message={error} className="mt-2" />
  </div>
);

export default function ShippingAddressForm() {
  const { auth } = usePage().props as { auth: { user: any } };
  const { storeShippingDetail, updateShippingDetail, selectedShippingDetail, toggleShowForm } = useShipping();

  const { data, setData, processing, errors, reset } = useForm<Record<FieldKey, string>>({
    full_name: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (selectedShippingDetail) {
      setData({
        full_name: selectedShippingDetail.full_name || '',
        phone: selectedShippingDetail.phone || '',
        country: selectedShippingDetail.country || 'United Kingdom',
        address_line1: selectedShippingDetail.address_line1 || '',
        address_line2: selectedShippingDetail.address_line2 || '',
        city: selectedShippingDetail.city || '',
        state: selectedShippingDetail.state || '',
        zip: selectedShippingDetail.zip || '',
      });
    } else {
      reset(); // if adding new, clear form
    }
  }, [selectedShippingDetail, setData, reset]);

  // Clear state if country doesn't have states
  useEffect(() => {
    if (!countriesWithStates.includes(data.country)) {
      setData('state', '');
    }
  }, [data.country, setData]);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      if (selectedShippingDetail) {
        // Editing existing
        await updateShippingDetail(selectedShippingDetail.id, data as ShippingDetail);
      } else {
        // Adding new
        await storeShippingDetail(data as ShippingDetail);
      }
      reset();
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const showStateField = countriesWithStates.includes(data.country);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormInput
        id="full_name"
        name="full_name"
        value={data.full_name}
        onChange={(e) => setData('full_name', e.target.value)}
        label="Full Name"
        error={errors.full_name}
        required
      />

      {/* Conditionally show Email field if user is not logged in */}
      {!auth.user && (
        <FormInput
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          label="Email"
          error={errors.email}
          required
        />
      )}

      <div>
        <InputLabel htmlFor="country" value="Country" />
        <select
          id="country"
          name="country"
          value={data.country}
          onChange={(e) => setData('country', e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 dark:text-white"
          required
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <InputError message={errors.country} className="mt-2" />
      </div>

      <FormInput
        id="address_line1"
        name="address_line1"
        value={data.address_line1}
        onChange={(e) => setData('address_line1', e.target.value)}
        label="Address Line 1"
        error={errors.address_line1}
        required
        autoComplete="address-line1"
      />

      <FormInput
        id="address_line2"
        name="address_line2"
        value={data.address_line2}
        onChange={(e) => setData('address_line2', e.target.value)}
        label="Address Line 2 (Optional)"
        error={errors.address_line2}
        autoComplete="address-line2"
      />

      <FormInput
        id="city"
        name="city"
        value={data.city}
        onChange={(e) => setData('city', e.target.value)}
        label="City"
        error={errors.city}
        required
        autoComplete="address-level2"
      />

      {showStateField && (
        <FormInput
          id="state"
          name="state"
          value={data.state}
          onChange={(e) => setData('state', e.target.value)}
          label="State / Province"
          error={errors.state}
          required={showStateField}
          autoComplete="address-level1"
        />
      )}

      <FormInput
        id="zip"
        name="zip"
        value={data.zip}
        onChange={(e) => setData('zip', e.target.value)}
        label="Postal Code"
        error={errors.zip}
        required
        autoComplete="postal-code"
      />

      {/* Show Phone Number only if user is not logged in */}
      {!auth.user && (
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => setData('phone', e.target.value)}
          label="Phone Number (Optional)"
          error={errors.phone}
        />
      )}

      <div className="flex gap-4 mt-4">
        <SecondaryButton onClick={toggleShowForm} className="w-1/2">
          Cancel
        </SecondaryButton>

        <PrimaryButton
          type="submit"
          className="w-1/2 rounded-lg"
          disabled={processing}
        >
          {selectedShippingDetail ? 'Update Address' : 'Add Address'}
        </PrimaryButton>
      </div>
    </form>
  );
}
