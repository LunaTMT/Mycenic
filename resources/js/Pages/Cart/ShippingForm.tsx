import React, { useCallback } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/Login/InputLabel';
import TextInput from '@/Components/Login/TextInput';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import InputError from '@/Components/Login/InputError';
import { countries } from '@/utils/countries';

// Modal form extracted for cleaner EstimatedShipping component
const ShippingDetailsForm = ({ onClose, setShippingDetailsSet }) => {
  const { data, setData, errors, processing, reset } = useForm({
    country: 'United Kingdom',
    zip: '',
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!data.country.trim() || !data.zip.trim()) {
        return;
      }

      // Simulate saving and setting the shipping details
      setShippingDetailsSet(true); // Mark shipping details as set
      onClose(); // Close the modal
      reset({ country: 'United Kingdom', zip: '' }); // Reset the form state
    },
    [data.country, data.zip, onClose, reset, setShippingDetailsSet]
  );

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Enter Shipping Details
      </h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <InputLabel htmlFor="country" value="Country *" />
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
          <InputLabel htmlFor="zip" value="Postal / Zip Code *" />
          <TextInput
            id="zip"
            name="zip"
            type="text"
            value={data.zip}
            onChange={(e) => setData('zip', e.target.value)}
            className="mt-1 w-full"
            required
          />
          <InputError message={errors.zip} className="mt-2" />
        </div>

        <div className="flex gap-4 mt-6">
          <SecondaryButton type="button" onClick={onClose} className="w-1/2">
            Cancel
          </SecondaryButton>

          <PrimaryButton type="submit" disabled={processing} className="w-1/2">
            Save
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default ShippingDetailsForm;
