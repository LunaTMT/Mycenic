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
import { useShipping } from '@/Contexts/Shop/Cart/ShippingContext'; // Import from context
import { ShippingDetails } from '@/Contexts/Shop/Cart/ShippingContext'; // Import the type

type FieldKey = 'address' | 'city' | 'zip';

export default function UpdateShippingDetailsForm() {
  const { cart } = useCart();  // If you need to use the cart or trigger shipping estimate

  // Using useShipping for shipping details and rates
  const {
    addAddress,  // Use addAddress from context
    
    toggleDropdown,
    // Toggle form visibility
  } = useShipping();

  const { data, setData, processing, errors, reset, setError, clearErrors } = useForm<Record<FieldKey, string>>({
    address: '',
    city: '',
    zip: '',
  });

  const user = usePage().props.auth;

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    clearErrors();

    try {
      const validation = await axios.post(route('shipping.validate.address'), data);

      if (validation.data.valid) {
        const hasUnconfirmed = validation.data.data?.verdict?.hasUnconfirmedComponents;
        
        // Create a new address with an ID (temporary or backend-generated)
        let newAddress: ShippingDetails = {
          id: user ? validation.data.data.id : Math.random().toString(36).substring(7), // Generate temporary ID for local addresses
          address: data.address,
          city: data.city,
          zip: data.zip,
        };

        if (user) {
          // If the user is logged in, save address to the backend
          const response = await axios.post(route('user.addresses.store'), newAddress);
          newAddress = response.data.address;
        }

        addAddress(newAddress, cart.length);

        reset();
        toggleDropdown();  // Close the form dropdown after submission

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
    toggleDropdown();   // Set FormDropdownOpen to false to close the form
  };

  return (
    <form
      onSubmit={submit}
      className={`space-y-4 `}
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

      <div className="flex gap-4">
        <PrimaryButton className="w-1/2" disabled={processing}>
          Save Address
        </PrimaryButton>

        <SecondaryButton className="w-1/2" onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
