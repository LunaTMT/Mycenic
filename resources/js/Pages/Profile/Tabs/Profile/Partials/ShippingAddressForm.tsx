import React, { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useShipping } from '@/Contexts/Profile/ShippingContext';

type FieldKey = 'address' | 'city' | 'zip';

export default function ShippingAddressForm() {
  const { addAddress } = useShipping();

  const { data, setData, processing, errors, reset } = useForm<Record<FieldKey, string>>({
    address: '',
    city: '',
    zip: '',
  });

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await addAddress(data);
      reset();
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };


  return (
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
        />
        <InputError message={errors.address} className="mt-2" />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <InputLabel htmlFor="city" value="City" />
          <TextInput
            id="city"
            name="city"
            type="text"
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
            type="text"
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
  );
}
