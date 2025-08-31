import React, { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import FormField from '@/Components/Form/FormField';
import InputLabel from '@/Components/Login/InputLabel';
import InputError from '@/Components/Login/InputError';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import { countries, countriesWithStates } from '@/utils/countries';
import { ShippingDetail } from '@/types/Shipping';

type FieldKey =
  | 'full_name'
  | 'country'
  | 'address_line1'
  | 'address_line2'
  | 'city'
  | 'state'
  | 'zip';

const defaultForm: Record<FieldKey, string> = {
  full_name: '',
  country: 'United Kingdom',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  zip: '',
};

export default function ShippingAddressForm() {
  const { auth } = usePage().props as { auth: { user: any } };
  const { storeShippingDetail, updateShippingDetail, selectedShippingDetail, toggleShowForm } = useShipping();

  const { data, setData, processing, errors, reset } = useForm(defaultForm);

  // Populate form when editing
  useEffect(() => {
    if (selectedShippingDetail) {
      setData({
        full_name: selectedShippingDetail.full_name ?? '',
        country: selectedShippingDetail.country ?? 'United Kingdom',
        address_line1: selectedShippingDetail.address_line1 ?? '',
        address_line2: selectedShippingDetail.address_line2 ?? '',
        city: selectedShippingDetail.city ?? '',
        state: selectedShippingDetail.state ?? '',
        zip: selectedShippingDetail.zip ?? '',
      });
    } else {
      reset();
    }
  }, [selectedShippingDetail, setData, reset]);

  // Reset state if country doesn’t support states
  useEffect(() => {
    if (!countriesWithStates.includes(data.country)) {
      setData('state', '');
    }
  }, [data.country, setData]);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();

    try {
      if (selectedShippingDetail) {
        // Update existing address (guest or user)
        await updateShippingDetail(selectedShippingDetail.id, data as ShippingDetail);
      } else {
        // Store new address (guest or user)
        await storeShippingDetail(data as ShippingDetail);
        reset(); // Reset form after creating a new address
      }
    } catch (err) {
      console.error('Error submitting shipping detail:', err);
    }
  };


  const showStateField = countriesWithStates.includes(data.country);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormField
        id="full_name"
        label="Full Name"
        value={data.full_name}
        onChange={(e) => setData('full_name', e.target.value)}
        error={errors.full_name}
        required
      />

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

      <FormField
        id="address_line1"
        label="Address Line 1"
        value={data.address_line1}
        onChange={(e) => setData('address_line1', e.target.value)}
        error={errors.address_line1}
        required
        autoComplete="address-line1"
      />

      <FormField
        id="address_line2"
        label="Address Line 2 (Optional)"
        value={data.address_line2}
        onChange={(e) => setData('address_line2', e.target.value)}
        error={errors.address_line2}
        autoComplete="address-line2"
      />

      <FormField
        id="city"
        label="City"
        value={data.city}
        onChange={(e) => setData('city', e.target.value)}
        error={errors.city}
        required
        autoComplete="address-level2"
      />

      {showStateField && (
        <FormField
          id="state"
          label="State / Province"
          value={data.state}
          onChange={(e) => setData('state', e.target.value)}
          error={errors.state}
          required
          autoComplete="address-level1"
        />
      )}

      <FormField
        id="zip"
        label="Postal Code"
        value={data.zip}
        onChange={(e) => setData('zip', e.target.value)}
        error={errors.zip}
        required
        autoComplete="postal-code"
      />

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
