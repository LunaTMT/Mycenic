import React, { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useCart } from '@/Contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

type FieldKey = 'address' | 'city' | 'zip';

export default function UpdateShippingDetailsForm() {
  const { shippingDetails, setShippingDetails } = useCart();

  const { data, setData, post, processing, errors } = useForm<Record<FieldKey, string>>({
    address: '',
    city: '',
    zip: '',
  });

  // Fetch shipping details from backend when component mounts
  useEffect(() => {
    axios.get(route('profile.shipping-details'))
      .then(response => {
        const { address, city, zip } = response.data;
        console.log(response);
        setData({
          address: address || '',
          city: city || '',
          zip: zip || '',
        });
      })
      .catch(() => {
        toast.error("Failed to load shipping details.");
      });
  }, []);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(route('shipping.validate.address'), data);

      if (response.data.valid) {
        setShippingDetails(data);

        await axios.post(route('profile.update-shipping'), {
          ...data,
          _method: 'PATCH',
        });

        toast.success("Shipping details updated.");
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
    <section className="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
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

        <PrimaryButton className="rounded-lg w-1/4" disabled={processing}>
          UPDATE
        </PrimaryButton>
      </form>
    </section>
  );
}
