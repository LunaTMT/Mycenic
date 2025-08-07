import React, { FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import { useShipping } from '@/Contexts/Shop/Cart/ShippingContext';
import { ShippingDetails } from '@/Contexts/Shop/Cart/ShippingContext';

type FieldKey = 'name' | 'address' | 'city' | 'zip' | 'phone' | 'email';

export default function UpdateShippingDetailsForm() {
  const { cart } = useCart();

  const {
    addAddress,
    toggleDropdown,
  } = useShipping();

  const { data, setData, processing, errors, reset, setError, clearErrors } = useForm<Record<FieldKey, string>>({
    name: '',  // Added name field
    address: '',
    city: '',
    zip: '',
    phone: '',  // Optional phone field
    email: '',  // Required email field
  });

  const user = usePage().props.auth;

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    clearErrors();

    try {
      const validation = await axios.post(route('shipping.validate.address'), data);

      if (validation.data.valid) {
        const hasUnconfirmed = validation.data.data?.verdict?.hasUnconfirmedComponents;

        let newAddress: ShippingDetails = {
          id: user ? validation.data.data.id : Math.random().toString(36).substring(7),
          name: data.name,  // Added name field
          address: data.address,
          city: data.city,
          zip: data.zip,
          phone: data.phone,  // Optional phone field
          email: data.email,  // Required email field
        };

        await axios.post(route('user.addresses.store'), newAddress);
     
        addAddress(newAddress, cart.length);

        reset();
        toggleDropdown();
      } else {
        toast.error(
          'Invalid address: ' +
            (validation.data.messages?.join(', ') || 'Please check your details.')
        );
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const onCancel = () => {
    toggleDropdown();
  };

  return (
    <form
      onSubmit={submit}
      className={`space-y-2 border-black/20 dark:border-white/20 border  rounded-lg p-3`}
      noValidate
    >

      <div>
        <InputLabel htmlFor="name" value="Full Name" />
        <TextInput
          id="name"
          name="name"
          type="text"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          className="mt-1 w-full"
          required
          aria-invalid={!!errors.name}
          aria-describedby="name-error"
        />
        <InputError message={errors.name} className="mt-2" id="name-error" />
      </div>

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

      <div>
        <InputLabel htmlFor="email" value="Email Address" />
        <TextInput
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          className="mt-1 w-full"
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        <InputError message={errors.email} className="mt-2" id="email-error" />
      </div>

      <div>
        <InputLabel htmlFor="phone" value="Phone Number (optional)" />
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => setData('phone', e.target.value)}
          className="mt-1 w-full"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby="phone-error"
        />
        <InputError message={errors.phone} className="mt-2" id="phone-error" />
      </div>

      <div className="flex gap-4 pt-2">
        <PrimaryButton className="w-1/2" disabled={processing}>
          Save 
        </PrimaryButton>

        <SecondaryButton className="w-1/2" onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
