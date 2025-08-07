import React, { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import { countries, countriesWithStates } from '@/utils/countries';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';

type FieldKey =
  | 'full_name'
  | 'phone'
  | 'country'
  | 'address_line1'
  | 'address_line2'
  | 'city'
  | 'state'
  | 'zip'
  | 'delivery_instructions';

interface ShippingAddressFormProps {
  closeModal: () => void;
}

export default function ShippingAddressForm({ closeModal }: ShippingAddressFormProps) {
  const { addShippingDetail } = useShipping();

  const { data, setData, processing, errors, reset } = useForm<Record<FieldKey, string>>({
    full_name: '',
    phone: '',
    country: 'United Kingdom',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    delivery_instructions: '',
  });

  useEffect(() => {
    if (!countriesWithStates.includes(data.country)) {
      setData('state', '');
    }
  }, [data.country, setData]);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await addShippingDetail(data);
      reset();
      closeModal();
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  const showStateField = countriesWithStates.includes(data.country);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <InputLabel htmlFor="full_name" value="Full Name" />
        <TextInput
          id="full_name"
          name="full_name"
          type="text"
          value={data.full_name}
          onChange={(e) => setData('full_name', e.target.value)}
          className="mt-1 w-full"
          required
        />
        <InputError message={errors.full_name} className="mt-2" />
      </div>

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

      <div>
        <InputLabel htmlFor="address_line1" value="Address Line 1" />
        <TextInput
          id="address_line1"
          name="address_line1"
          type="text"
          value={data.address_line1}
          onChange={(e) => setData('address_line1', e.target.value)}
          className="mt-1 w-full"
          required
          autoComplete="address-line1"
        />
        <InputError message={errors.address_line1} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="address_line2" value="Address Line 2 (Optional)" />
        <TextInput
          id="address_line2"
          name="address_line2"
          type="text"
          value={data.address_line2}
          onChange={(e) => setData('address_line2', e.target.value)}
          className="mt-1 w-full"
          autoComplete="address-line2"
        />
        <InputError message={errors.address_line2} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="city" value="City" />
        <TextInput
          id="city"
          name="city"
          type="text"
          value={data.city}
          onChange={(e) => setData('city', e.target.value)}
          className="mt-1 w-full"
          required
          autoComplete="address-level2"
        />
        <InputError message={errors.city} className="mt-2" />
      </div>

      {showStateField && (
        <div>
          <InputLabel htmlFor="state" value="State / Province" />
          <TextInput
            id="state"
            name="state"
            type="text"
            value={data.state}
            onChange={(e) => setData('state', e.target.value)}
            className="mt-1 w-full"
            autoComplete="address-level1"
            required={showStateField}
          />
          <InputError message={errors.state} className="mt-2" />
        </div>
      )}

      <div>
        <InputLabel htmlFor="zip" value="Postal Code" />
        <TextInput
          id="zip"
          name="zip"
          type="text"
          value={data.zip}
          onChange={(e) => setData('zip', e.target.value)}
          className="mt-1 w-full"
          required
          autoComplete="postal-code"
        />
        <InputError message={errors.zip} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="phone" value="Phone Number (Optional)" />
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => setData('phone', e.target.value)}
          className="mt-1 w-full"
        />
        <InputError message={errors.phone} className="mt-2" />
      </div>

      <div>
        <InputLabel htmlFor="delivery_instructions" value="Delivery Instructions (Optional)" />
        <textarea
          id="delivery_instructions"
          name="delivery_instructions"
          value={data.delivery_instructions}
          onChange={(e) => setData('delivery_instructions', e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 p-2 dark:bg-gray-700 dark:text-white"
          rows={3}
          placeholder="Leave any special instructions for delivery"
        />
        <InputError message={errors.delivery_instructions} className="mt-2" />
      </div>

      <div className="flex gap-4 mt-4">
        <SecondaryButton
          onClick={closeModal}
          className="w-1/2"
        >
          Cancel
        </SecondaryButton>

        <PrimaryButton
          type="submit"
          className="w-1/2 rounded-lg"
          disabled={processing}
        >
          Add Address
        </PrimaryButton>
      </div>
    </form>
  );
}
