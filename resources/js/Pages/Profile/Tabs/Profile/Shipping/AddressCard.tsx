import React, { useState } from 'react';
import { Address } from '@/types/Shipping';
import { useShipping } from '@/Contexts/User/ShippingContext';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '@/Components/Modal/Modal';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';

interface Props {
  address: Address;
  disableSelectedStyles?: boolean;
}

export default function AddressCard({
  address,
  disableSelectedStyles = false,
}: Props) {
  const { toggleShowForm, updateAddress, setSelectedAddress } = useShipping();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle the Edit action
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateAddress(address.id, address); // Ensure to pass the correct parameters for update
    toggleShowForm();
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    // Normally you would delete, not update, but keeping updateAddress for consistency
    await updateAddress(address.id, address); // This would normally be a delete function
    setShowDeleteModal(false);
  };

  // Mark address as default
  const handleSetAsDefault = async () => {
    const updatedAddress = { ...address, is_default: true }; // Mark this address as default
    await updateAddress(address.id, updatedAddress); // Update the address with the default flag
  };

  // Base classes for styling
  const baseClasses = 'relative border rounded-lg p-4 h-48 flex flex-col shadow-sm';
  const borderClasses = 'dark:border-white/20 border-black/20';

  // Background and ring classes
  let bgClasses = 'bg-white dark:bg-[#1e2124]/60';
  let ringClasses = '';

  if (disableSelectedStyles) {
    bgClasses = 'bg-white dark:bg-[#1e2124]/60 border-gray-300 dark:border-white/20';
  } else if (address.is_default) {
    bgClasses = 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40';
    ringClasses = 'ring-2 ring-green-400 dark:ring-green-300';
  } else {
    bgClasses += ' hover:bg-green-50 dark:hover:bg-green-900/50';
  }

  return (
    <>
      <div
        onClick={async () => {
          if (!disableSelectedStyles) {
            console.log('setting as default');
            await handleSetAsDefault(); // Set as default when the card is clicked
            await setSelectedAddress(address); // Set as selected address
          }
        }}
        className={`
          ${baseClasses} 
          ${borderClasses} 
          ${bgClasses} 
          ${ringClasses} 
        `}
      >
        {!!address.is_default && !disableSelectedStyles && (
          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <h3 className="font-semibold text-lg mb-2 dark:text-white">{address.full_name}</h3>
        <p className="text-sm dark:text-gray-300">{address.address_line1}</p>
        {address.address_line2 && <p className="text-sm dark:text-gray-300">{address.address_line2}</p>}
        <p className="text-sm dark:text-gray-300">
          {address.city}, {address.state ? `${address.state}, ` : ''}
          {address.zip}
        </p>
        <p className="text-sm dark:text-gray-300">{address.country}</p>
        <p className="text-sm mt-2 italic text-gray-500 dark:text-gray-400">{address.phone}</p>

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={handleEdit}
            aria-label="Edit Address"
            className="p-2 rounded-xl font-Poppins text-white bg-yellow-500 dark:bg-[#7289da] hover:scale-[103%] transition-all duration-300 flex justify-center items-center"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            aria-label="Delete Address"
            className="p-2 rounded-xl font-Poppins text-white bg-yellow-500 dark:bg-[#7289da] hover:scale-[103%] transition-all duration-300 flex justify-center items-center"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 flex justify-center items-center flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this shipping address?
            </p>
            <div className="flex justify-end space-x-4">
              <SecondaryButton className="px-5" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton className="px-5" onClick={confirmDelete}>
                Confirm
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
